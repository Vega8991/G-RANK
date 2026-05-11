const Lobby = require('../models/lobbyModel');
const LobbyParticipant = require('../models/lobbyParticipantModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');

// Map each error type to the HTTP status code and message we want to send back
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

// Register the logged-in user to a lobby.
// We use a MongoDB transaction so that if anything fails halfway through,
// the participant count doesn't get out of sync with the participants list.
const registerToLobby = async (req, res) => {
    const session = await mongoose.startSession();
    let registrationResult;

    try {
        await session.withTransaction(async () => {
            const userId = req.userId;
            const lobbyId = req.body.lobbyId;

            // Load the lobby
            const lobby = await Lobby.findById(lobbyId).session(session);
            if (!lobby) throw new Error('LOBBY_NOT_FOUND');

            // Check the lobby is accepting registrations
            if (lobby.status !== 'open') throw new Error('LOBBY_NOT_OPEN');

            // Check the registration deadline hasn't passed
            const now = new Date();
            if (now > lobby.registrationDeadline) throw new Error('DEADLINE_PASSED');

            // Check the user isn't already registered
            const alreadyRegistered = await LobbyParticipant.findOne({
                lobbyId: lobbyId,
                userId: userId
            }).session(session);
            if (alreadyRegistered) throw new Error('ALREADY_REGISTERED');

            // Load the user (we need their MMR to record it)
            const user = await User.findById(userId).session(session);
            if (!user) throw new Error('USER_NOT_FOUND');

            // Try to add the user to the lobby — this also increments the participant count.
            // The condition { currentParticipants: { $lt: lobby.maxParticipants } } ensures
            // two people can't register at the exact same time and exceed the limit.
            const updatedLobby = await Lobby.findOneAndUpdate(
                {
                    _id: lobbyId,
                    currentParticipants: { $lt: lobby.maxParticipants } // $lt = less than
                },
                {
                    $inc: { currentParticipants: 1 } // $inc = increment by 1
                },
                {
                    new: true,
                    session: session
                }
            );
            if (!updatedLobby) throw new Error('LOBBY_FULL');

            // Save the participant record
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
        // Look up the error in our table. If it's not there, return a generic 500.
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

// Get all lobbies the logged-in user has registered to
const getMyLobbies = async (req, res) => {
    try {
        const userId = req.userId;

        // Find all participant records for this user, and load the full lobby data
        const myParticipantRecords = await LobbyParticipant.find({ userId: userId })
            .populate('lobbyId'); // replace lobbyId with the actual Lobby object

        // Extract just the lobby from each record, and remove any that were deleted
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

// Remove the logged-in user from a lobby
const leaveLobby = async (req, res) => {
    const session = await mongoose.startSession();
    let leaveResult;

    try {
        await session.withTransaction(async () => {
            const userId = req.userId;
            const lobbyId = req.body.lobbyId;

            const lobby = await Lobby.findById(lobbyId).session(session);
            if (!lobby) throw new Error('LOBBY_NOT_FOUND');

            // You can only leave while the lobby is still open
            if (lobby.status !== 'open') throw new Error('CANNOT_LEAVE');

            // Delete the participant record (this also confirms they were registered)
            const deletedParticipant = await LobbyParticipant.findOneAndDelete({
                lobbyId: lobbyId,
                userId: userId
            }).session(session);
            if (!deletedParticipant) throw new Error('NOT_REGISTERED');

            // Decrease the participant count by 1
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
