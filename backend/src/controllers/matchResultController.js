const MatchResult = require('../models/matchResultModel');
const Tournament = require('../models/tournamentModel');
const TournamentParticipant = require('../models/tournamentParticipantModel');
const axios = require('axios');
const mongoose = require('mongoose');
const { calculateMMRChange, updateUserStats } = require('../services/mmrService');

const submitReplay = async function (req, res) {
    const session = await mongoose.startSession();
    
    try {
        let result;
        await session.withTransaction(async () => {
            const userId = req.userId;
            const { tournamentId, replayUrl } = req.body;

            const tournament = await Tournament.findById(tournamentId).session(session);
            if (!tournament) {
                throw new Error('TOURNAMENT_NOT_FOUND');
            }

            if (tournament.status !== 'pending') {
                throw new Error('TOURNAMENT_NOT_PENDING');
            }

            const participant = await TournamentParticipant.findOne({
                tournamentId: tournamentId,
                userId: userId
            }).session(session);

            if (!participant) {
                throw new Error('NOT_REGISTERED');
            }

            if (participant.hasSubmittedResults) {
                throw new Error('ALREADY_SUBMITTED');
            }

            const replayId = replayUrl.split('pokemonshowdown.com/')[1];
            const replayJsonUrl = `https://replay.pokemonshowdown.com/${replayId}.json`;

            let replayData;
            try {
                const response = await axios.get(replayJsonUrl);
                replayData = response.data;
            } catch (error) {
                throw new Error('INVALID_REPLAY_URL');
            }

            let winner = null;
            if (replayData.log) {
                const winMatch = replayData.log.match(/\|win\|(.+)/);
                if (winMatch && winMatch[1]) {
                    winner = winMatch[1].trim();
                }
            }

            if (!winner) {
                throw new Error('WINNER_NOT_FOUND');
            }

            const allParticipants = await TournamentParticipant.find({
                tournamentId: tournamentId
            }).populate('userId', 'username mmr').session(session);

            if (allParticipants.length !== 2) {
                throw new Error(`INVALID_PARTICIPANT_COUNT:${allParticipants.length}`);
            }

            let winnerId = null;
            let loserId = null;

            for (let participant of allParticipants) {
                if (participant.userId.username.toLowerCase() === winner.toLowerCase()) {
                    winnerId = participant.userId._id;
                } else {
                    loserId = participant.userId._id;
                }
            }

            if (!winnerId || !loserId) {
                throw new Error('PARTICIPANTS_MISMATCH');
            }

            const matchResult = await MatchResult.create([{
                tournamentId: tournamentId,
                replayUrl: replayUrl,
                winnerId: winnerId,
                loserId: loserId,
                replayData: replayData,
                verified: true,
                submittedBy: userId
            }], { session: session });

            const winnerParticipant = allParticipants.find(p => p.userId._id.toString() === winnerId.toString());
            const loserParticipant = allParticipants.find(p => p.userId._id.toString() === loserId.toString());

            const winnerMMRBefore = winnerParticipant.userId.mmr;
            const loserMMRBefore = loserParticipant.userId.mmr;

            const winnerMMRChange = calculateMMRChange(winnerMMRBefore, true);
            const loserMMRChange = calculateMMRChange(loserMMRBefore, false);

            const winnerUpdateResult = await updateUserStats(winnerId, true, winnerMMRChange, session);
            const loserUpdateResult = await updateUserStats(loserId, false, loserMMRChange, session);

            const updatedWinner = winnerUpdateResult.user;
            const updatedLoser = loserUpdateResult.user;

            winnerParticipant.mmrAfter = updatedWinner.mmr;
            winnerParticipant.mmrChange = winnerMMRChange;
            await winnerParticipant.save({ session: session });

            loserParticipant.mmrAfter = updatedLoser.mmr;
            loserParticipant.mmrChange = loserMMRChange;
            await loserParticipant.save({ session: session });

            participant.hasSubmittedResults = true;
            await participant.save({ session: session });

            tournament.status = 'completed';
            await tournament.save({ session: session });

            result = {
                success: true,
                message: 'Replay submitted and verified successfully',
                result: matchResult[0],
                winner: {
                    username: winnerParticipant.userId.username,
                    mmrBefore: winnerMMRBefore,
                    mmrChange: winnerMMRChange,
                    mmrAfter: updatedWinner.mmr,
                    newRank: updatedWinner.rank,
                    wins: updatedWinner.wins,
                    losses: updatedWinner.losses,
                    winRate: updatedWinner.winRate,
                    winStreak: updatedWinner.winStreak
                },
                loser: {
                    username: loserParticipant.userId.username,
                    mmrBefore: loserMMRBefore,
                    mmrChange: loserMMRChange,
                    mmrAfter: updatedLoser.mmr,
                    newRank: updatedLoser.rank,
                    wins: updatedLoser.wins,
                    losses: updatedLoser.losses,
                    winRate: updatedLoser.winRate,
                    winStreak: updatedLoser.winStreak
                }
            };
        });

        return res.status(201).json(result);

    } catch (error) {
        const errorCode = error.message || 'UNKNOWN_ERROR';
        let statusCode = 500;
        let message = 'Error submitting replay';

        switch (true) {
            case errorCode === 'TOURNAMENT_NOT_FOUND':
                statusCode = 404;
                message = 'Tournament not found';
                break;
            case errorCode === 'TOURNAMENT_NOT_PENDING':
                statusCode = 400;
                message = 'Tournament is not in pending status';
                break;
            case errorCode === 'NOT_REGISTERED':
                statusCode = 403;
                message = 'You are not registered in this tournament';
                break;
            case errorCode === 'ALREADY_SUBMITTED':
                statusCode = 400;
                message = 'You have already submitted results for this tournament';
                break;
            case errorCode === 'INVALID_REPLAY_URL':
                statusCode = 400;
                message = 'Invalid replay URL or replay not found';
                break;
            case errorCode === 'WINNER_NOT_FOUND':
                statusCode = 400;
                message = 'Could not find winner in replay data';
                break;
            case errorCode.startsWith('INVALID_PARTICIPANT_COUNT'):
                statusCode = 400;
                const count = errorCode.split(':')[1];
                message = `Tournament must have exactly 2 participants. Found: ${count}`;
                break;
            case errorCode === 'PARTICIPANTS_MISMATCH':
                statusCode = 400;
                message = 'Could not match replay participants with tournament participants';
                break;
            default:
                message = error.message || message;
        }

        return res.status(statusCode).json({
            success: false,
            message: message
        });
    } finally {
        await session.endSession();
    }
};

const getTournamentResults = async function (req, res) {
    try {
        const tournamentId = req.params.tournamentId;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        const results = await MatchResult.find({ tournamentId: tournamentId })
            .populate('winnerId', 'username rank mmr')
            .populate('loserId', 'username rank mmr')
            .populate('submittedBy', 'username');

        return res.status(200).json({
            success: true,
            tournament: tournament,
            results: results
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching tournament results',
            error: error.message
        });
    }
};

module.exports = {
    submitReplay,
    getTournamentResults
};
