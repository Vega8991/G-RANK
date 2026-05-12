const MatchResult = require('../models/matchResultModel');
const Lobby = require('../models/lobbyModel');
const LobbyParticipant = require('../models/lobbyParticipantModel');
const axios = require('axios');
const mongoose = require('mongoose');
const { calculateMMRChange, updateUserStats } = require('../services/mmrService');

const ERROR_RESPONSES = {
    'LOBBY_NOT_FOUND':       { status: 404, message: 'Lobby not found' },
    'LOBBY_NOT_PENDING':     { status: 400, message: 'Lobby is not in pending status' },
    'NOT_REGISTERED':        { status: 403, message: 'You are not registered in this lobby' },
    'ALREADY_SUBMITTED':     { status: 400, message: 'You have already submitted results for this lobby' },
    'INVALID_REPLAY_URL':    { status: 400, message: 'Invalid replay URL or replay not found' },
    'WINNER_NOT_FOUND':      { status: 400, message: 'Could not determine match winner' },
    'PARTICIPANTS_MISMATCH': { status: 400, message: 'Could not match replay participants with lobby participants' }
};

const submitReplay = async function (req, res) {
    const session = await mongoose.startSession();
    let submitResult;

    try {
        await session.withTransaction(async () => {
            const userId = req.userId;
            const lobbyId = req.body.lobbyId;
            const replayUrl = req.body.replayUrl;

            const lobby = await Lobby.findById(lobbyId).session(session);
            if (!lobby) throw new Error('LOBBY_NOT_FOUND');
            if (lobby.status !== 'pending') throw new Error('LOBBY_NOT_PENDING');

            const submitterParticipant = await LobbyParticipant.findOne({
                lobbyId: lobbyId,
                userId: userId
            }).session(session);
            if (!submitterParticipant) throw new Error('NOT_REGISTERED');
            if (submitterParticipant.hasSubmittedResults) throw new Error('ALREADY_SUBMITTED');

            const replayId = replayUrl.split('pokemonshowdown.com/')[1];
            const replayJsonUrl = `https://replay.pokemonshowdown.com/${replayId}.json`;

            let replayData;
            try {
                const replayResponse = await axios.get(replayJsonUrl);
                replayData = replayResponse.data;
            } catch (fetchError) {
                throw new Error('INVALID_REPLAY_URL');
            }

            let winnerName = null;
            if (replayData.log) {
                const winLine = replayData.log.match(/\|win\|(.+)/);
                if (winLine && winLine[1]) {
                    winnerName = winLine[1].trim();
                }
            }
            if (!winnerName) throw new Error('WINNER_NOT_FOUND');

            const allParticipants = await LobbyParticipant.find({ lobbyId: lobbyId })
                .populate('userId', 'username mmr')
                .session(session);

            if (allParticipants.length !== 2) {
                throw new Error('INVALID_PARTICIPANT_COUNT:' + allParticipants.length);
            }

            let winnerParticipant = null;
            let loserParticipant = null;

            for (let i = 0; i < allParticipants.length; i++) {
                const participant = allParticipants[i];
                const participantUsername = participant.userId.username;

                if (participantUsername.toLowerCase() === winnerName.toLowerCase()) {
                    winnerParticipant = participant;
                } else {
                    loserParticipant = participant;
                }
            }

            if (!winnerParticipant || !loserParticipant) throw new Error('PARTICIPANTS_MISMATCH');

            await MatchResult.create([{
                lobbyId: lobbyId,
                replayUrl: replayUrl,
                winnerId: winnerParticipant.userId._id,
                loserId: loserParticipant.userId._id,
                replayData: replayData,
                verified: true,
                submittedBy: userId
            }], { session: session });

            const winnerMMRBefore = winnerParticipant.userId.mmr;
            const loserMMRBefore = loserParticipant.userId.mmr;

            const winnerMMRChange = calculateMMRChange(winnerMMRBefore, true);
            const loserMMRChange = calculateMMRChange(loserMMRBefore, false);

            const winnerUpdateResult = await updateUserStats(winnerParticipant.userId._id, true, winnerMMRChange, session);
            const loserUpdateResult = await updateUserStats(loserParticipant.userId._id, false, loserMMRChange, session);

            const updatedWinner = winnerUpdateResult.user;
            const updatedLoser = loserUpdateResult.user;

            winnerParticipant.mmrAfter = updatedWinner.mmr;
            winnerParticipant.mmrChange = winnerMMRChange;
            await winnerParticipant.save({ session: session });

            loserParticipant.mmrAfter = updatedLoser.mmr;
            loserParticipant.mmrChange = loserMMRChange;
            await loserParticipant.save({ session: session });

            submitterParticipant.hasSubmittedResults = true;
            await submitterParticipant.save({ session: session });

            lobby.status = 'completed';
            await lobby.save({ session: session });

            submitResult = {
                success: true,
                message: 'Replay submitted and verified successfully',
                result: {
                    winner: {
                        username: winnerParticipant.userId.username,
                        mmrChange: {
                            before: winnerMMRBefore,
                            change: winnerMMRChange,
                            after: updatedWinner.mmr
                        }
                    },
                    loser: {
                        username: loserParticipant.userId.username,
                        mmrChange: {
                            before: loserMMRBefore,
                            change: loserMMRChange,
                            after: updatedLoser.mmr
                        }
                    }
                }
            };
        });

        return res.status(201).json(submitResult);

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
            return res.status(errorInfo.status).json({
                success: false,
                message: errorInfo.message
            });
        }

        return res.status(500).json({
            success: false,
            message: errorMessage
        });
    } finally {
        await session.endSession();
    }
};

const getLobbyResults = async function (req, res) {
    try {
        const lobbyId = req.params.lobbyId;

        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            return res.status(404).json({
                success: false,
                message: 'Lobby not found'
            });
        }

        const results = await MatchResult.find({ lobbyId: lobbyId })
            .populate('winnerId', 'username rank mmr')
            .populate('loserId', 'username rank mmr')
            .populate('submittedBy', 'username');

        return res.status(200).json({
            success: true,
            lobby: lobby,
            results: results
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching lobby results',
            error: error.message
        });
    }
};

module.exports = {
    submitReplay,
    getLobbyResults
};
