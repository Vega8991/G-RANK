const Tournament = require('../models/tournamentModel');
const TournamentParticipant = require('../models/tournamentParticipantModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const registerToTournament = async (req, res) => {
    const session = await mongoose.startSession();
    
    try {
        let result;
        await session.withTransaction(async () => {
            const userId = req.userId;
            const { tournamentId } = req.body;

            const tournament = await Tournament.findById(tournamentId).session(session);

            if (!tournament) {
                throw new Error('TOURNAMENT_NOT_FOUND');
            }

            if (tournament.status !== 'open') {
                throw new Error('TOURNAMENT_NOT_OPEN');
            }

            const currentDate = new Date();

            if (currentDate > tournament.registrationDeadline) {
                throw new Error('DEADLINE_PASSED');
            }

            const existingParticipant = await TournamentParticipant.findOne({
                tournamentId: tournamentId,
                userId: userId
            }).session(session);

            if (existingParticipant) {
                throw new Error('ALREADY_REGISTERED');
            }

            const participantCount = await TournamentParticipant.countDocuments({
                tournamentId: tournamentId
            }).session(session);

            if (participantCount >= tournament.maxParticipants) {
                throw new Error('TOURNAMENT_FULL');
            }

            const user = await User.findById(userId).session(session);
            
            if (!user) {
                throw new Error('USER_NOT_FOUND');
            }

            const newParticipant = await TournamentParticipant.create([{
                tournamentId: tournamentId,
                userId: userId,
                mmrBefore: user.mmr
            }], { session: session });

            tournament.currentParticipants = participantCount + 1;
            await tournament.save({ session: session });

            result = {
                success: true,
                message: 'Registered to tournament successfully',
                participant: newParticipant[0]
            };
        });

        return res.status(201).json(result);
    } catch (error) {
        const errorCode = error.message || 'UNKNOWN_ERROR';
        let statusCode = 500;
        let message = 'Error registering to tournament';

        switch (errorCode) {
            case 'TOURNAMENT_NOT_FOUND':
            case 'USER_NOT_FOUND':
                statusCode = 404;
                message = errorCode === 'TOURNAMENT_NOT_FOUND' ? 'Tournament not found' : 'User not found';
                break;
            case 'ALREADY_REGISTERED':
            case 'TOURNAMENT_FULL':
            case 'TOURNAMENT_NOT_OPEN':
            case 'DEADLINE_PASSED':
                statusCode = 400;
                message = errorCode === 'ALREADY_REGISTERED' ? 'You are already registered in this tournament' :
                         errorCode === 'TOURNAMENT_FULL' ? 'Tournament is full' :
                         errorCode === 'TOURNAMENT_NOT_OPEN' ? 'Tournament is not open for registration' :
                         'Registration deadline has passed';
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

const getMyTournaments = async (req, res) => {
    try {
        const userId = req.userId;

        const participants = await TournamentParticipant.find({ userId })
            .populate('tournamentId');

        const tournaments = participants.map(p => p.tournamentId);

        return res.status(200).json({
            success: true,
            tournaments: tournaments
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching tournaments',
            error: error.message
        });
    }
};

module.exports = {
    registerToTournament,
    getMyTournaments
};
