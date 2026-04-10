const mongoose = require('mongoose');
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

// POST /api/riot/link
// Body: { gameName, tagLine, platform }
// Links a Riot account to the authenticated G-RANK user.
const linkRiotAccount = async function (req, res) {
    try {
        const userId = req.userId;
        const { gameName, tagLine, platform } = req.body;

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

        const cluster = riotService.getClusterFromPlatform(platform);
        let accountData;
        try {
            accountData = await riotService.getAccountByRiotId(gameName, tagLine, cluster);
        } catch (err) {
            const status = err.response?.status;
            if (status === 404) {
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

        // Check if another user already has this PUUID linked
        const existing = await User.findOne({
            riotPuuid: accountData.puuid,
            _id: { $ne: userId }
        });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'This Riot account is already linked to another G-RANK account'
            });
        }

        await User.findByIdAndUpdate(userId, {
            riotGameName: accountData.gameName,
            riotTagLine:  accountData.tagLine,
            riotPuuid:    accountData.puuid,
            riotPlatform: platform.toLowerCase()
        });

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
// Returns the full Riot profile (LoL ranked stats, top champions) for the authenticated user.
const getMyRiotProfile = async function (req, res) {
    try {
        const user = await User.findById(req.userId);
        if (!user?.riotPuuid) {
            return res.status(404).json({
                success: false,
                message: 'No Riot account linked. Use POST /api/riot/link first.'
            });
        }

        const profile = await riotService.getFullLolProfile(user.riotPuuid, user.riotPlatform);
        return res.status(200).json({ success: true, profile });

    } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
            return res.status(404).json({ success: false, message: 'Summoner not found on Riot servers' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/riot/profile/:riotId   (riotId = "gameName-tagLine", dash as separator for URL safety)
// Public profile lookup for any Riot ID.
const getRiotProfileByRiotId = async function (req, res) {
    try {
        const { riotId } = req.params;
        const { platform = 'na1' } = req.query;

        const dashIdx = riotId.lastIndexOf('-');
        if (dashIdx === -1) {
            return res.status(400).json({ success: false, message: 'riotId must be in format gameName-tagLine' });
        }

        const gameName = riotId.slice(0, dashIdx);
        const tagLine  = riotId.slice(dashIdx + 1);
        const cluster  = riotService.getClusterFromPlatform(platform);

        const accountData = await riotService.getAccountByRiotId(gameName, tagLine, cluster);
        const profile = await riotService.getFullLolProfile(accountData.puuid, platform);

        return res.status(200).json({ success: true, profile });

    } catch (error) {
        const status = error.response?.status;
        if (status === 404) {
            return res.status(404).json({ success: false, message: 'Riot account not found' });
        }
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ──────────────────────────────────────────────────────────
//  SHARED INTERNAL HELPER: resolve winner/loser from lobby
// ──────────────────────────────────────────────────────────
async function resolveMatchResult(lobbyId, submitterId, winnerPuuid, loserPuuid, matchRef, gameType, matchData, session) {
    const lobby = await Lobby.findById(lobbyId).session(session);
    if (!lobby) throw new Error('LOBBY_NOT_FOUND');
    if (lobby.status !== 'pending') throw new Error('LOBBY_NOT_PENDING');
    if (lobby.game !== gameType) throw new Error('GAME_MISMATCH');

    const submitterParticipant = await LobbyParticipant.findOne({
        lobbyId, userId: submitterId
    }).session(session);

    if (!submitterParticipant) throw new Error('NOT_REGISTERED');
    if (submitterParticipant.hasSubmittedResults) throw new Error('ALREADY_SUBMITTED');

    const allParticipants = await LobbyParticipant.find({ lobbyId })
        .populate('userId', 'username mmr riotPuuid')
        .session(session);

    if (allParticipants.length !== 2) {
        throw new Error(`INVALID_PARTICIPANT_COUNT:${allParticipants.length}`);
    }

    const winnerParticipant = allParticipants.find(p => p.userId.riotPuuid === winnerPuuid);
    const loserParticipant  = allParticipants.find(p => p.userId.riotPuuid === loserPuuid);

    if (!winnerParticipant || !loserParticipant) {
        throw new Error('PARTICIPANTS_MISMATCH');
    }

    const winnerId = winnerParticipant.userId._id;
    const loserId  = loserParticipant.userId._id;

    await MatchResult.create([{
        lobbyId,
        game:      gameType,
        matchId:   matchRef,
        replayUrl: null,
        winnerId,
        loserId,
        replayData: matchData,
        verified: true,
        submittedBy: submitterId
    }], { session });

    const winnerMMRBefore = winnerParticipant.userId.mmr;
    const loserMMRBefore  = loserParticipant.userId.mmr;

    const winnerMMRChange = calculateMMRChange(winnerMMRBefore, true);
    const loserMMRChange  = calculateMMRChange(loserMMRBefore, false);

    const winnerUpdateResult = await updateUserStats(winnerId, true,  winnerMMRChange, session);
    const loserUpdateResult  = await updateUserStats(loserId,  false, loserMMRChange,  session);

    const updatedWinner = winnerUpdateResult.user;
    const updatedLoser  = loserUpdateResult.user;

    winnerParticipant.mmrAfter  = updatedWinner.mmr;
    winnerParticipant.mmrChange = winnerMMRChange;
    await winnerParticipant.save({ session });

    loserParticipant.mmrAfter  = updatedLoser.mmr;
    loserParticipant.mmrChange = loserMMRChange;
    await loserParticipant.save({ session });

    submitterParticipant.hasSubmittedResults = true;
    await submitterParticipant.save({ session });

    lobby.status = 'completed';
    await lobby.save({ session });

    return {
        success: true,
        message: 'Match verified and MMR updated successfully',
        winner: {
            username:   winnerParticipant.userId.username,
            mmrBefore:  winnerMMRBefore,
            mmrChange:  winnerMMRChange,
            mmrAfter:   updatedWinner.mmr,
            newRank:    updatedWinner.rank,
            wins:       updatedWinner.wins,
            losses:     updatedWinner.losses,
            winRate:    updatedWinner.winRate,
            winStreak:  updatedWinner.winStreak
        },
        loser: {
            username:   loserParticipant.userId.username,
            mmrBefore:  loserMMRBefore,
            mmrChange:  loserMMRChange,
            mmrAfter:   updatedLoser.mmr,
            newRank:    updatedLoser.rank,
            wins:       updatedLoser.wins,
            losses:     updatedLoser.losses,
            winRate:    updatedLoser.winRate,
            winStreak:  updatedLoser.winStreak
        }
    };
}

function buildErrorResponse(errorCode) {
    switch (true) {
        case errorCode === 'LOBBY_NOT_FOUND':
            return { status: 404, message: 'Lobby not found' };
        case errorCode === 'LOBBY_NOT_PENDING':
            return { status: 400, message: 'Lobby is not in pending status' };
        case errorCode === 'GAME_MISMATCH':
            return { status: 400, message: 'Lobby game does not match the submitted match type' };
        case errorCode === 'NOT_REGISTERED':
            return { status: 403, message: 'You are not registered in this lobby' };
        case errorCode === 'ALREADY_SUBMITTED':
            return { status: 400, message: 'You have already submitted results for this lobby' };
        case errorCode === 'RIOT_ACCOUNT_NOT_LINKED':
            return { status: 400, message: 'One or more participants have not linked their Riot account' };
        case errorCode === 'MATCH_NOT_FOUND':
            return { status: 404, message: 'Match not found on Riot servers. Check the match ID.' };
        case errorCode === 'WINNER_NOT_FOUND':
            return { status: 400, message: 'Could not determine match winner' };
        case errorCode === 'PARTICIPANTS_MISMATCH':
            return { status: 400, message: 'Lobby participants were not found in this match. Make sure both players linked their correct Riot account.' };
        case errorCode.startsWith('INVALID_PARTICIPANT_COUNT'):
            return { status: 400, message: `Lobby must have exactly 2 participants. Found: ${errorCode.split(':')[1]}` };
        default:
            return { status: 500, message: errorCode };
    }
}

// POST /api/riot/submit-lol-match
// Body: { lobbyId, matchId }   (matchId like "NA1_1234567890")
const submitLolMatch = async function (req, res) {
    const session = await mongoose.startSession();

    try {
        let result;
        await session.withTransaction(async () => {
            const { lobbyId, matchId } = req.body;
            if (!lobbyId || !matchId) throw new Error('lobbyId and matchId are required');

            // Fetch match from Riot
            let matchData;
            try {
                matchData = await riotService.getLolMatchById(matchId);
            } catch (err) {
                if (err.response?.status === 404) throw new Error('MATCH_NOT_FOUND');
                throw err;
            }

            // Each participant in matchData.info.participants has { puuid, win }
            const riotParticipants = matchData.info?.participants;
            if (!riotParticipants || riotParticipants.length === 0) {
                throw new Error('WINNER_NOT_FOUND');
            }

            // We need to find the two lobby participants' PUUIDs inside the match
            const allLobbyParticipants = await LobbyParticipant.find({ lobbyId })
                .populate('userId', 'username riotPuuid')
                .session(session);

            for (const lp of allLobbyParticipants) {
                if (!lp.userId.riotPuuid) throw new Error('RIOT_ACCOUNT_NOT_LINKED');
            }

            const lobbyPuuids = allLobbyParticipants.map(lp => lp.userId.riotPuuid);

            // Find each lobby player's result inside the Riot match
            const matchedPlayers = riotParticipants.filter(p => lobbyPuuids.includes(p.puuid));
            if (matchedPlayers.length < 2) throw new Error('PARTICIPANTS_MISMATCH');

            const winnerRiot = matchedPlayers.find(p => p.win === true);
            const loserRiot  = matchedPlayers.find(p => p.win === false);
            if (!winnerRiot || !loserRiot) throw new Error('WINNER_NOT_FOUND');

            result = await resolveMatchResult(
                lobbyId,
                req.userId,
                winnerRiot.puuid,
                loserRiot.puuid,
                matchId,
                'league_of_legends',
                matchData,
                session
            );
        });

        return res.status(201).json(result);

    } catch (error) {
        const { status, message } = buildErrorResponse(error.message || 'UNKNOWN_ERROR');
        return res.status(status).json({ success: false, message });
    } finally {
        await session.endSession();
    }
};

// POST /api/riot/submit-valorant-match
// Body: { lobbyId, matchId, platform }   (platform like "na", "eu", "ap", "kr", "br", "latam")
const submitValorantMatch = async function (req, res) {
    const session = await mongoose.startSession();

    try {
        let result;
        await session.withTransaction(async () => {
            const { lobbyId, matchId, platform } = req.body;
            if (!lobbyId || !matchId) throw new Error('lobbyId and matchId are required');

            const allLobbyParticipants = await LobbyParticipant.find({ lobbyId })
                .populate('userId', 'username riotPuuid riotPlatform')
                .session(session);

            for (const lp of allLobbyParticipants) {
                if (!lp.userId.riotPuuid) throw new Error('RIOT_ACCOUNT_NOT_LINKED');
            }

            // Determine Valorant platform: use request body, or derive from first participant's linked platform
            const valPlatform = platform ||
                riotService.getValPlatformFromLolPlatform(allLobbyParticipants[0].userId.riotPlatform || 'na1');

            let matchData;
            try {
                matchData = await riotService.getValorantMatchById(matchId, valPlatform);
            } catch (err) {
                if (err.response?.status === 404) throw new Error('MATCH_NOT_FOUND');
                throw err;
            }

            // Valorant match structure: matchData.players[] and matchData.teams[]
            const riotPlayers = matchData.players || [];
            const riotTeams   = matchData.teams || [];
            if (riotPlayers.length === 0 || riotTeams.length === 0) throw new Error('WINNER_NOT_FOUND');

            const lobbyPuuids = allLobbyParticipants.map(lp => lp.userId.riotPuuid);
            const matchedPlayers = riotPlayers.filter(p => lobbyPuuids.includes(p.puuid));
            if (matchedPlayers.length < 2) throw new Error('PARTICIPANTS_MISMATCH');

            // Determine win for each matched player via their teamId
            function didPlayerWin(player) {
                const team = riotTeams.find(t => t.teamId === player.teamId);
                return team?.won === true;
            }

            const winnerRiot = matchedPlayers.find(p => didPlayerWin(p));
            const loserRiot  = matchedPlayers.find(p => !didPlayerWin(p));
            if (!winnerRiot || !loserRiot) throw new Error('WINNER_NOT_FOUND');

            result = await resolveMatchResult(
                lobbyId,
                req.userId,
                winnerRiot.puuid,
                loserRiot.puuid,
                matchId,
                'valorant',
                matchData,
                session
            );
        });

        return res.status(201).json(result);

    } catch (error) {
        const { status, message } = buildErrorResponse(error.message || 'UNKNOWN_ERROR');
        return res.status(status).json({ success: false, message });
    } finally {
        await session.endSession();
    }
};

module.exports = {
    linkRiotAccount,
    unlinkRiotAccount,
    getMyRiotProfile,
    getRiotProfileByRiotId,
    submitLolMatch,
    submitValorantMatch
};
