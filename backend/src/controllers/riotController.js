const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/userModel');
const Lobby = require('../models/lobbyModel');
const LobbyParticipant = require('../models/lobbyParticipantModel');
const MatchResult = require('../models/matchResultModel');
const riotService = require('../services/riotService');
const { calculateMMRChange, updateUserStats } = require('../services/mmrService');

const VALID_PLATFORMS = [
    'na1', 'na2', 'br1', 'la1', 'la2',
    'euw1', 'eun1', 'tr1', 'ru',
    'kr', 'jp1',
    'oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'
];

// Map error types to HTTP status codes and messages
const ERROR_RESPONSES = {
    'LOBBY_NOT_FOUND':             { status: 404, message: 'Lobby not found' },
    'LOBBY_NOT_PENDING':           { status: 400, message: 'Lobby is not in pending status' },
    'GAME_MISMATCH':               { status: 400, message: 'Lobby game does not match the submitted match type' },
    'NOT_REGISTERED':              { status: 403, message: 'You are not registered in this lobby' },
    'ALREADY_SUBMITTED':           { status: 400, message: 'You have already submitted results for this lobby' },
    'RIOT_ACCOUNT_NOT_LINKED':     { status: 400, message: 'One or more participants have not linked their Riot account' },
    'MATCH_NOT_FOUND':             { status: 404, message: 'Match not found on Riot servers. Check the match ID.' },
    'WINNER_NOT_FOUND':            { status: 400, message: 'Could not determine match winner' },
    'PARTICIPANTS_MISMATCH':       { status: 400, message: 'Lobby participants were not found in this match. Make sure both players linked their correct Riot account.' }
};

// Helper: given a cached Riot profile from the API response, build the object we store in the database
function buildCachedProfile(profile) {
    const soloQueue = profile.rankedSolo;
    return {
        tier:          soloQueue ? soloQueue.tier         : null,
        rank:          soloQueue ? soloQueue.rank         : null,
        leaguePoints:  soloQueue ? soloQueue.leaguePoints : null,
        rankedWins:    soloQueue ? soloQueue.wins         : null,
        rankedLosses:  soloQueue ? soloQueue.losses       : null,
        summonerLevel: profile.summoner ? profile.summoner.summonerLevel : null,
        profileIconId: profile.summoner ? profile.summoner.profileIconId : null,
        hotStreak:     soloQueue ? soloQueue.hotStreak : false,
        lastUpdated:   new Date()
    };
}

// POST /api/riot/link
// Links a Riot account to the logged-in G-RANK user.
// Body: { gameName, tagLine, platform }
const linkRiotAccount = async function (req, res) {
    try {
        const userId = req.userId;
        const gameName = req.body.gameName;
        const tagLine = req.body.tagLine;
        const platform = req.body.platform;

        if (!gameName || !tagLine || !platform) {
            return res.status(400).json({
                success: false,
                message: 'gameName, tagLine and platform are required'
            });
        }

        if (!VALID_PLATFORMS.includes(platform.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid platform. Valid options: ${VALID_PLATFORMS.join(', ')}`
            });
        }

        // Look up the Riot account by their in-game name and tag
        const cluster = riotService.getClusterFromPlatform(platform);
        let accountData;
        try {
            accountData = await riotService.getAccountByRiotId(gameName, tagLine, cluster);
        } catch (riotError) {
            if (riotError.response && riotError.response.status === 404) {
                return res.status(404).json({
                    success: false,
                    message: `Riot account "${gameName}#${tagLine}" not found`
                });
            }
            return res.status(502).json({
                success: false,
                message: 'Could not reach Riot API. Try again later.'
            });
        }

        // Make sure this Riot account isn't already linked to a different G-RANK user
        const alreadyLinkedToOtherUser = await User.findOne({
            riotPuuid: accountData.puuid,
            _id: { $ne: userId } // $ne = "not equal to"
        });
        if (alreadyLinkedToOtherUser) {
            return res.status(409).json({
                success: false,
                message: 'This Riot account is already linked to another G-RANK account'
            });
        }

        const updateData = {
            riotGameName: accountData.gameName,
            riotTagLine:  accountData.tagLine,
            riotPuuid:    accountData.puuid,
            riotPlatform: platform.toLowerCase()
        };

        // Try to fetch and cache ranked stats right away.
        // If this fails, the account still links successfully — stats can be refreshed later.
        try {
            const profile = await riotService.getFullLolProfile(accountData.puuid, platform.toLowerCase());
            updateData.riotCachedProfile = buildCachedProfile(profile);
        } catch (cacheError) {
            // Non-critical — just skip the cache
        }

        await User.findByIdAndUpdate(userId, updateData);

        return res.status(200).json({
            success: true,
            message: `Riot account ${accountData.gameName}#${accountData.tagLine} linked successfully`,
            riotAccount: {
                gameName: accountData.gameName,
                tagLine:  accountData.tagLine,
                puuid:    accountData.puuid,
                platform: platform.toLowerCase()
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error linking Riot account',
            error: error.message
        });
    }
};

// DELETE /api/riot/unlink
// Removes the Riot account link from the logged-in user
const unlinkRiotAccount = async function (req, res) {
    try {
        await User.findByIdAndUpdate(req.userId, {
            riotGameName: null,
            riotTagLine:  null,
            riotPuuid:    null,
            riotPlatform: null
        });
        return res.status(200).json({ success: true, message: 'Riot account unlinked' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/riot/profile
// Returns fresh ranked stats from Riot for the logged-in user, and saves them to the database
const getMyRiotProfile = async function (req, res) {
    try {
        const user = await User.findById(req.userId);

        if (!user || !user.riotPuuid) {
            return res.status(404).json({
                success: false,
                message: 'No Riot account linked. Use POST /api/riot/link first.'
            });
        }

        const profile = await riotService.getFullLolProfile(user.riotPuuid, user.riotPlatform);

        // Save the fresh stats to the database cache
        await User.findByIdAndUpdate(req.userId, {
            riotCachedProfile: buildCachedProfile(profile)
        });

        return res.status(200).json({ success: true, profile: profile });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ success: false, message: 'Summoner not found on Riot servers' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/riot/profile/:riotId
// Public lookup for any Riot account. riotId format: "gameName-tagLine" (dash as separator)
const getRiotProfileByRiotId = async function (req, res) {
    try {
        const riotId = req.params.riotId;
        const platform = req.query.platform || 'na1';

        // Split on the last dash to get gameName and tagLine
        const lastDashIndex = riotId.lastIndexOf('-');
        if (lastDashIndex === -1) {
            return res.status(400).json({
                success: false,
                message: 'riotId must be in format gameName-tagLine'
            });
        }

        const gameName = riotId.slice(0, lastDashIndex);
        const tagLine  = riotId.slice(lastDashIndex + 1);
        const cluster  = riotService.getClusterFromPlatform(platform);

        const accountData = await riotService.getAccountByRiotId(gameName, tagLine, cluster);
        const profile = await riotService.getFullLolProfile(accountData.puuid, platform);

        return res.status(200).json({ success: true, profile: profile });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ success: false, message: 'Riot account not found' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Shared helper used by submitLolMatch.
// Resolves who won and lost a match, updates MMR, and closes the lobby.
async function resolveMatchResult(lobbyId, submitterId, winnerPuuid, loserPuuid, matchRef, gameType, matchData, session) {
    // Step 1: Load and validate the lobby
    const lobby = await Lobby.findById(lobbyId).session(session);
    if (!lobby) throw new Error('LOBBY_NOT_FOUND');
    if (lobby.status !== 'pending') throw new Error('LOBBY_NOT_PENDING');
    if (lobby.game !== gameType) throw new Error('GAME_MISMATCH');

    // Step 2: Verify the submitter is a registered participant who hasn't already submitted
    const submitterParticipant = await LobbyParticipant.findOne({
        lobbyId: lobbyId,
        userId: submitterId
    }).session(session);
    if (!submitterParticipant) throw new Error('NOT_REGISTERED');
    if (submitterParticipant.hasSubmittedResults) throw new Error('ALREADY_SUBMITTED');

    // Step 3: Load all lobby participants with their Riot PUUIDs
    const allParticipants = await LobbyParticipant.find({ lobbyId: lobbyId })
        .populate('userId', 'username mmr riotPuuid')
        .session(session);

    if (allParticipants.length !== 2) {
        throw new Error('INVALID_PARTICIPANT_COUNT:' + allParticipants.length);
    }

    // Step 4: Match each lobby participant to the winner/loser PUUID from Riot
    const winnerParticipant = allParticipants.find(function (p) {
        return p.userId.riotPuuid === winnerPuuid;
    });
    const loserParticipant = allParticipants.find(function (p) {
        return p.userId.riotPuuid === loserPuuid;
    });

    if (!winnerParticipant || !loserParticipant) throw new Error('PARTICIPANTS_MISMATCH');

    const winnerId = winnerParticipant.userId._id;
    const loserId  = loserParticipant.userId._id;

    // Step 5: Save the match result record
    await MatchResult.create([{
        lobbyId:    lobbyId,
        game:       gameType,
        matchId:    matchRef,
        replayUrl:  null,
        winnerId:   winnerId,
        loserId:    loserId,
        replayData: matchData,
        verified:   true,
        submittedBy: submitterId
    }], { session: session });

    // Step 6: Calculate and apply MMR changes
    const winnerMMRBefore = winnerParticipant.userId.mmr;
    const loserMMRBefore  = loserParticipant.userId.mmr;

    const winnerMMRChange = calculateMMRChange(winnerMMRBefore, true);
    const loserMMRChange  = calculateMMRChange(loserMMRBefore, false);

    const winnerUpdateResult = await updateUserStats(winnerId, true,  winnerMMRChange, session);
    const loserUpdateResult  = await updateUserStats(loserId,  false, loserMMRChange,  session);

    const updatedWinner = winnerUpdateResult.user;
    const updatedLoser  = loserUpdateResult.user;

    // Step 7: Record MMR changes on each participant record
    winnerParticipant.mmrAfter  = updatedWinner.mmr;
    winnerParticipant.mmrChange = winnerMMRChange;
    await winnerParticipant.save({ session: session });

    loserParticipant.mmrAfter  = updatedLoser.mmr;
    loserParticipant.mmrChange = loserMMRChange;
    await loserParticipant.save({ session: session });

    submitterParticipant.hasSubmittedResults = true;
    await submitterParticipant.save({ session: session });

    // Step 8: Close the lobby
    lobby.status = 'completed';
    await lobby.save({ session: session });

    return {
        success: true,
        message: 'Match verified and MMR updated successfully',
        winner: {
            username:  winnerParticipant.userId.username,
            mmrBefore: winnerMMRBefore,
            mmrChange: winnerMMRChange,
            mmrAfter:  updatedWinner.mmr,
            newRank:   updatedWinner.rank,
            wins:      updatedWinner.wins,
            losses:    updatedWinner.losses,
            winRate:   updatedWinner.winRate,
            winStreak: updatedWinner.winStreak
        },
        loser: {
            username:  loserParticipant.userId.username,
            mmrBefore: loserMMRBefore,
            mmrChange: loserMMRChange,
            mmrAfter:  updatedLoser.mmr,
            newRank:   updatedLoser.rank,
            wins:      updatedLoser.wins,
            losses:    updatedLoser.losses,
            winRate:   updatedLoser.winRate,
            winStreak: updatedLoser.winStreak
        }
    };
}

// POST /api/riot/submit-lol-match
// Submit a League of Legends match ID to verify a result and update MMR
// Body: { lobbyId, matchId }  — matchId looks like "NA1_1234567890"
const submitLolMatch = async function (req, res) {
    const session = await mongoose.startSession();
    let matchResult;

    try {
        await session.withTransaction(async () => {
            const lobbyId = req.body.lobbyId;
            const matchId = req.body.matchId;

            if (!lobbyId || !matchId) {
                throw new Error('lobbyId and matchId are required');
            }

            // Fetch the match data from Riot API
            let matchData;
            try {
                matchData = await riotService.getLolMatchById(matchId);
            } catch (riotError) {
                if (riotError.response && riotError.response.status === 404) {
                    throw new Error('MATCH_NOT_FOUND');
                }
                throw riotError;
            }

            // matchData.info.participants is an array of all players in the match,
            // each with { puuid, win: true/false }
            const riotParticipants = matchData.info ? matchData.info.participants : null;
            if (!riotParticipants || riotParticipants.length === 0) {
                throw new Error('WINNER_NOT_FOUND');
            }

            // Load the two lobby participants and verify they have Riot accounts linked
            const lobbyParticipants = await LobbyParticipant.find({ lobbyId: lobbyId })
                .populate('userId', 'username riotPuuid')
                .session(session);

            for (let i = 0; i < lobbyParticipants.length; i++) {
                if (!lobbyParticipants[i].userId.riotPuuid) {
                    throw new Error('RIOT_ACCOUNT_NOT_LINKED');
                }
            }

            // Get the PUUIDs of the two lobby players
            const lobbyPuuids = lobbyParticipants.map(function (p) { return p.userId.riotPuuid; });

            // Find those two players inside the Riot match data
            const matchedPlayers = riotParticipants.filter(function (p) {
                return lobbyPuuids.includes(p.puuid);
            });
            if (matchedPlayers.length < 2) throw new Error('PARTICIPANTS_MISMATCH');

            const winnerInMatch = matchedPlayers.find(function (p) { return p.win === true; });
            const loserInMatch  = matchedPlayers.find(function (p) { return p.win === false; });
            if (!winnerInMatch || !loserInMatch) throw new Error('WINNER_NOT_FOUND');

            matchResult = await resolveMatchResult(
                lobbyId,
                req.userId,
                winnerInMatch.puuid,
                loserInMatch.puuid,
                matchId,
                'league_of_legends',
                matchData,
                session
            );
        });

        return res.status(201).json(matchResult);

    } catch (error) {
        const errorMessage = error.message || 'UNKNOWN_ERROR';

        if (errorMessage.startsWith('INVALID_PARTICIPANT_COUNT')) {
            const participantCount = errorMessage.split(':')[1];
            return res.status(400).json({
                success: false,
                message: `Lobby must have exactly 2 participants. Found: ${participantCount}`
            });
        }

        const errorInfo = ERROR_RESPONSES[errorMessage];
        if (errorInfo) {
            return res.status(errorInfo.status).json({ success: false, message: errorInfo.message });
        }

        return res.status(500).json({ success: false, message: errorMessage });

    } finally {
        await session.endSession();
    }
};

// GET /api/riot/oauth/url?platform=na1
// Returns the Riot OAuth authorization URL so the user can log in with their Riot account
const getRiotOAuthUrl = async function (req, res) {
    try {
        const platform = req.query.platform || 'na1';

        if (!VALID_PLATFORMS.includes(platform.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: `Invalid platform. Valid options: ${VALID_PLATFORMS.join(', ')}`
            });
        }

        if (!process.env.RIOT_CLIENT_ID || !process.env.RIOT_REDIRECT_URI) {
            return res.status(503).json({
                success: false,
                message: 'Riot OAuth is not configured on this server.'
            });
        }

        // Encode userId and platform in the "state" parameter so we can read them in the callback
        const stateData = JSON.stringify({
            userId:   req.userId,
            platform: platform.toLowerCase()
        });
        const state = Buffer.from(stateData).toString('base64url');

        const queryParams = new URLSearchParams({
            client_id:     process.env.RIOT_CLIENT_ID,
            redirect_uri:  process.env.RIOT_REDIRECT_URI,
            response_type: 'code',
            scope:         'openid',
            state:         state
        });

        const oauthUrl = `https://auth.riotgames.com/authorize?${queryParams.toString()}`;
        return res.status(200).json({ success: true, url: oauthUrl });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/riot/oauth/callback?code=...&state=...
// Riot redirects to this URL after the user logs in. We use the code to get an access token,
// then fetch the user's Riot account info and save it.
const handleRiotOAuthCallback = async function (req, res) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    try {
        const code = req.query.code;
        const state = req.query.state;
        const oauthError = req.query.error;

        // If Riot returned an error, redirect to the dashboard with an error message
        if (oauthError) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=${encodeURIComponent(oauthError)}`);
        }

        if (!code || !state) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=missing_params`);
        }

        // Decode the state parameter to get userId and platform
        let userId;
        let platform;
        try {
            const decodedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
            userId   = decodedState.userId;
            platform = decodedState.platform;
        } catch (decodeError) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=invalid_state`);
        }

        if (!userId || !platform) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=invalid_state`);
        }

        // Exchange the authorization code for an access token
        let tokenData;
        try {
            const tokenResponse = await axios.post(
                'https://auth.riotgames.com/token',
                new URLSearchParams({
                    grant_type:   'authorization_code',
                    code:         code,
                    redirect_uri: process.env.RIOT_REDIRECT_URI
                }).toString(),
                {
                    auth: {
                        username: process.env.RIOT_CLIENT_ID,
                        password: process.env.RIOT_CLIENT_SECRET
                    },
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }
            );
            tokenData = tokenResponse.data;
        } catch (tokenError) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=token_exchange_failed`);
        }

        const accessToken = tokenData.access_token;
        if (!accessToken) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=no_access_token`);
        }

        // Use the access token to fetch the user's Riot account info
        const cluster = riotService.getClusterFromPlatform(platform);
        let accountData;
        try {
            const accountResponse = await axios.get(
                `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/me`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            accountData = accountResponse.data; // { puuid, gameName, tagLine }
        } catch (accountError) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=account_fetch_failed`);
        }

        const puuid    = accountData.puuid;
        const gameName = accountData.gameName;
        const tagLine  = accountData.tagLine;

        // Make sure this Riot account isn't already linked to a different G-RANK user
        const alreadyLinked = await User.findOne({
            riotPuuid: puuid,
            _id: { $ne: userId }
        });
        if (alreadyLinked) {
            return res.redirect(`${frontendUrl}/dashboard?riot_error=already_linked`);
        }

        const updateData = {
            riotGameName: gameName,
            riotTagLine:  tagLine,
            riotPuuid:    puuid,
            riotPlatform: platform
        };

        // Try to cache ranked stats immediately — non-critical if it fails
        try {
            const profile = await riotService.getFullLolProfile(puuid, platform);
            updateData.riotCachedProfile = buildCachedProfile(profile);
        } catch (cacheError) {
            // Skip — stats can be refreshed later from the dashboard
        }

        await User.findByIdAndUpdate(userId, updateData);

        return res.redirect(`${frontendUrl}/dashboard?riot_linked=1`);

    } catch (error) {
        return res.redirect(`${frontendUrl}/dashboard?riot_error=server_error`);
    }
};

module.exports = {
    linkRiotAccount,
    unlinkRiotAccount,
    getMyRiotProfile,
    getRiotProfileByRiotId,
    submitLolMatch,
    getRiotOAuthUrl,
    handleRiotOAuthCallback
};
