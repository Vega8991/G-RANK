const Lobby = require('../models/lobbyModel');
const LobbyParticipant = require('../models/lobbyParticipantModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

const ERROR_RESPONSES = {
    'LOBBY_NOT_FOUND':    { status: 404, message: 'Lobby not found' },
    'USER_NOT_FOUND':     { status: 404, message: 'User not found' },
    'LOBBY_NOT_OPEN':     { status: 400, message: 'Lobby is not open for registration' },
    'DEADLINE_PASSED':    { status: 400, message: 'Registration deadline has passed' },
    'ALREADY_REGISTERED': { status: 400, message: 'You are already registered in this lobby' },
    'LOBBY_FULL':         { status: 400, message: 'Lobby is full' },
    'NOT_REGISTERED':     { status: 400, message: 'You are not registered in this lobby' },
    'CANNOT_LEAVE':       { status: 400, message: 'Cannot leave a lobby that is no longer open' }
};

const registerToLobby = async (req, res) => {
    const session = await mongoose.startSession();
    let registrationResult;

    try {
        await session.withTransaction(async () => {
            const userId = req.userId;
            const lobbyId = req.body.lobbyId;

            const lobby = await Lobby.findById(lobbyId).session(session);
            if (!lobby) throw new Error('LOBBY_NOT_FOUND');

            if (lobby.status !== 'open') throw new Error('LOBBY_NOT_OPEN');

            const now = new Date();
            if (now > lobby.registrationDeadline) throw new Error('DEADLINE_PASSED');

            const alreadyRegistered = await LobbyParticipant.findOne({
                lobbyId: lobbyId,
                userId: userId
            }).session(session);
            if (alreadyRegistered) throw new Error('ALREADY_REGISTERED');

            const user = await User.findById(userId).session(session);
            if (!user) throw new Error('USER_NOT_FOUND');

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
            if (!updatedLobby) throw new Error('LOBBY_FULL');

            const newParticipantList = await LobbyParticipant.create([{
                lobbyId: lobbyId,
                userId: userId,
                mmrBefore: user.mmr
            }], { session: session });

            registrationResult = {
                success: true,
                message: 'Registered to lobby successfully',
                participant: newParticipantList[0]
            };
        });

        return res.status(201).json(registrationResult);

    } catch (error) {
        const errorInfo = ERROR_RESPONSES[error.message];

        if (errorInfo) {
            return res.status(errorInfo.status).json({
                success: false,
                message: errorInfo.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Error registering to lobby'
        });
    } finally {
        await session.endSession();
    }
};

const getMyLobbies = async (req, res) => {
    try {
        const userId = req.userId;

        const myParticipantRecords = await LobbyParticipant.find({ userId: userId })
            .populate('lobbyId');

        const lobbies = myParticipantRecords
            .map(function (record) { return record.lobbyId; })
            .filter(Boolean);

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

const leaveLobby = async (req, res) => {
    const session = await mongoose.startSession();
    let leaveResult;

    try {
        await session.withTransaction(async () => {
            const userId = req.userId;
            const lobbyId = req.body.lobbyId;

            const lobby = await Lobby.findById(lobbyId).session(session);
            if (!lobby) throw new Error('LOBBY_NOT_FOUND');

            if (lobby.status !== 'open') throw new Error('CANNOT_LEAVE');

            const deletedParticipant = await LobbyParticipant.findOneAndDelete({
                lobbyId: lobbyId,
                userId: userId
            }).session(session);
            if (!deletedParticipant) throw new Error('NOT_REGISTERED');

            await Lobby.findByIdAndUpdate(
                lobbyId,
                { $inc: { currentParticipants: -1 } },
                { session: session }
            );

            leaveResult = {
                success: true,
                message: 'Left lobby successfully'
            };
        });

        return res.status(200).json(leaveResult);

    } catch (error) {
        const errorInfo = ERROR_RESPONSES[error.message];

        if (errorInfo) {
            return res.status(errorInfo.status).json({
                success: false,
                message: errorInfo.message
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || 'Error leaving lobby'
        });
    } finally {
        await session.endSession();
    }
};

module.exports = {
    registerToLobby,
    getMyLobbies,
    leaveLobby
};
