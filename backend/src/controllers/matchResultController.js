const MatchResult = require('../models/matchResultModel');
const Tournament = require('../models/tournamentModel');
const TournamentParticipant = require('../models/tournamentParticipantModel');
const axios = require('axios');
const { calculateMMRChange, updateUserStats } = require('../services/mmrService');

const submitReplay = async function (req, res) {
    try {
        const userId = req.userId;
        const { tournamentId, replayUrl } = req.body;

        const tournament = await Tournament.findById(tournamentId);
        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        if (tournament.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Tournament is not in pending status'
            });
        }

        const participant = await TournamentParticipant.findOne({
            tournamentId: tournamentId,
            userId: userId
        });

        if (!participant) {
            return res.status(403).json({
                success: false,
                message: 'You are not registered in this tournament'
            });
        }

        if (participant.hasSubmittedResults) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted results for this tournament'
            });
        }

        const replayId = replayUrl.split('pokemonshowdown.com/')[1];
        const replayJsonUrl = `https://replay.pokemonshowdown.com/${replayId}.json`;

        let replayData;
        try {
            const response = await axios.get(replayJsonUrl);
            replayData = response.data;
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid replay URL or replay not found'
            });
        }

        const winner = replayData.winner;

        const allParticipants = await TournamentParticipant.find({
            tournamentId: tournamentId
        }).populate('userId', 'username mmr');

        // Verificar que hay exactamente 2 participantes
        if (allParticipants.length !== 2) {
            return res.status(400).json({
                success: false,
                message: `Tournament must have exactly 2 participants. Found: ${allParticipants.length}`
            });
        }

        let winnerId = null;
        let loserId = null;

        for (let participant of allParticipants) {
            if (participant.userId.username === winner) {
                winnerId = participant.userId._id;
            } else {
                loserId = participant.userId._id;
            }
        }

        // Validación de que encontramos ganador y perdedor
        if (!winnerId || !loserId) {
            return res.status(400).json({
                success: false,
                message: 'Could not match replay participants with tournament participants',
                debug: {
                    replayWinner: winner,
                    tournamentParticipants: allParticipants.map(p => p.userId.username)
                }
            });
        }

        const matchResult = await MatchResult.create({
            tournamentId: tournamentId,
            replayUrl: replayUrl,
            winnerId: winnerId,
            loserId: loserId,
            replayData: replayData,
            verified: true,
            submittedBy: userId
        });

        const winnerParticipant = allParticipants.find(p => p.userId._id.toString() === winnerId.toString());
        const loserParticipant = allParticipants.find(p => p.userId._id.toString() === loserId.toString());

        const winnerMMRChange = calculateMMRChange(winnerParticipant.userId.mmr, true);
        const loserMMRChange = calculateMMRChange(loserParticipant.userId.mmr, false);

        const updatedWinner = await updateUserStats(winnerId, true, winnerMMRChange);
        const updatedLoser = await updateUserStats(loserId, false, loserMMRChange);

        winnerParticipant.mmrAfter = updatedWinner.mmr;
        winnerParticipant.mmrChange = winnerMMRChange;
        await winnerParticipant.save();

        loserParticipant.mmrAfter = updatedLoser.mmr;
        loserParticipant.mmrChange = loserMMRChange;
        await loserParticipant.save();

        participant.hasSubmittedResults = true;
        await participant.save();

        tournament.status = 'completed';
        await tournament.save();

        return res.status(201).json({
            success: true,
            message: 'Replay submitted and verified successfully',
            result: matchResult,
            winner: {
                username: winner,
                mmrChange: winnerMMRChange,
                newMMR: updatedWinner.mmr,
                newRank: updatedWinner.rank
            },
            loser: {
                mmrChange: loserMMRChange,
                newMMR: updatedLoser.mmr,
                newRank: updatedLoser.rank
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error submitting replay',
            error: error.message
        });
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
