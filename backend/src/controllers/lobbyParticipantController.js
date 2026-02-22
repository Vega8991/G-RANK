const Lobby = require('../models/lobbyModel');
const LobbyParticipant = require('../models/lobbyParticipantModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const registerToLobby = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        let result;
        await session.withTransaction(async () => {
            const userId = req.userId;
            const { lobbyId } = req.body;

            const lobby = await Lobby.findById(lobbyId).session(session);

            if (!lobby) {
                throw new Error('LOBBY_NOT_FOUND');
            }

            if (lobby.status !== 'open') {
                throw new Error('LOBBY_NOT_OPEN');
            }

            const currentDate = new Date();

            if (currentDate > lobby.registrationDeadline) {
                throw new Error('DEADLINE_PASSED');
            }

            const existingParticipant = await LobbyParticipant.findOne({
                lobbyId: lobbyId,
                userId: userId
            }).session(session);

            if (existingParticipant) {
                throw new Error('ALREADY_REGISTERED');
            }

            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new Error('USER_NOT_FOUND');
            }

            const updatedLobby = await Lobby.findOneAndUpdate(
                {
                    _id: lobbyId,
                    currentParticipants: { $lt: lobby.maxParticipants }
                },
                {
                    $inc: { currentParticipants: 1 }
                },
                {
                    new: true,
                    session: session
                }
            );

            if (!updatedLobby) {
                throw new Error('LOBBY_FULL');
            }

            const newParticipant = await LobbyParticipant.create([{
                lobbyId: lobbyId,
                userId: userId,
                mmrBefore: user.mmr
            }], { session: session });

            result = {
                success: true,
                message: 'Registered to lobby successfully',
                participant: newParticipant[0]
            };
        });

        return res.status(201).json(result);
    } catch (error) {
        const errorCode = error.message || 'UNKNOWN_ERROR';
        let statusCode = 500;
        let message = 'Error registering to lobby';

        switch (errorCode) {
            case 'LOBBY_NOT_FOUND':
            case 'USER_NOT_FOUND':
                statusCode = 404;
                message = errorCode === 'LOBBY_NOT_FOUND' ? 'Lobby not found' : 'User not found';
                break;
            case 'ALREADY_REGISTERED':
            case 'LOBBY_FULL':
            case 'LOBBY_NOT_OPEN':
            case 'DEADLINE_PASSED':
                statusCode = 400;
                message = errorCode === 'ALREADY_REGISTERED' ? 'You are already registered in this lobby' :
                    errorCode === 'LOBBY_FULL' ? 'Lobby is full' :
                        errorCode === 'LOBBY_NOT_OPEN' ? 'Lobby is not open for registration' :
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

const getMyLobbies = async (req, res) => {
    try {
        const userId = req.userId;

        const participants = await LobbyParticipant.find({ userId })
            .populate('lobbyId');

        const lobbies = participants.map(p => p.lobbyId);

        return res.status(200).json({
            success: true,
            lobbies: lobbies
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching lobbies',
            error: error.message
        });
    }
};

module.exports = {
    registerToLobby,
    getMyLobbies
};
