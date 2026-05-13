const Lobby = require('../models/lobbyModel');
const LobbyParticipant = require('../models/lobbyParticipantModel');

async function createLobby(req, res) {
    try {
        const userId = req.userId;

        if (!req.body.name || !req.body.description) {
            return res.status(400).json({
                success: false,
                message: 'Name and description are required'
            });
        }

        if (!req.body.registrationDeadline || !req.body.matchDateTime) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline and match date are required'
            });
        }

        const registrationDeadline = new Date(req.body.registrationDeadline);
        const matchDateTime = new Date(req.body.matchDateTime);
        const now = new Date();

        if (isNaN(registrationDeadline.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid registration deadline date format'
            });
        }

        if (isNaN(matchDateTime.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid match date format'
            });
        }

        if (registrationDeadline <= now) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be in the future'
            });
        }

        if (matchDateTime <= registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Match date must be after registration deadline'
            });
        }

        const newLobby = await Lobby.create({
            name: req.body.name,
            game: req.body.game || 'pokemon_showdown',
            description: req.body.description,
            registrationDeadline: registrationDeadline,
            matchDateTime: matchDateTime,
            maxParticipants: req.body.maxParticipants || 2,
            prizePool: req.body.prizePool || '',
            createdBy: userId
        });

        return res.status(201).json({
            success: true,
            message: 'Lobby created successfully',
            lobby: newLobby
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating lobby'
        });
    }
}

async function getAllLobbies(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const lobbies = await Lobby.find()
            .populate('createdBy', 'username')
            .skip(skip)
            .limit(limit);

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
}

async function getLobbyById(req, res) {
    try {
        const lobby = await Lobby.findById(req.params.id)
            .populate('createdBy', 'username');

        if (!lobby) {
            return res.status(404).json({
                success: false,
                message: 'Lobby not found'
            });
        }

        return res.status(200).json({
            success: true,
            lobby: lobby
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching lobby'
        });
    }
}

async function getMyCreatedLobbies(req, res) {
    try {
        const lobbies = await Lobby.find({ createdBy: req.userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            lobbies: lobbies
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching your lobbies',
            error: error.message
        });
    }
}

async function updateLobbyStatus(req, res) {
    try {
        const lobbyId = req.params.id;
        const { status } = req.body;

        const lobby = await Lobby.findById(lobbyId);

        if (!lobby) {
            return res.status(404).json({
                success: false,
                message: 'Lobby not found'
            });
        }

        if (lobby.createdBy.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the lobby creator can update its status'
            });
        }

        const validStatuses = ['open', 'pending', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: open, pending, in_progress, completed, or cancelled'
            });
        }

        lobby.status = status;
        await lobby.save();

        return res.status(200).json({
            success: true,
            message: 'Lobby status updated successfully',
            lobby: lobby
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating lobby status',
            error: error.message
        });
    }
}

async function syncParticipantCounts(req, res) {
    try {
        const lobbies = await Lobby.find();
        let updatedCount = 0;

        for (const lobby of lobbies) {
            const actualCount = await LobbyParticipant.countDocuments({
                lobbyId: lobby._id
            });

            if (lobby.currentParticipants !== actualCount) {
                lobby.currentParticipants = actualCount;
                await lobby.save();
                updatedCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Synchronized ${updatedCount} lobby(s)`,
            totalLobbies: lobbies.length,
            updated: updatedCount
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error synchronizing participant counts',
            error: error.message
        });
    }
}

module.exports = {
    createLobby,
    getAllLobbies,
    getLobbyById,
    getMyCreatedLobbies,
    updateLobbyStatus,
    syncParticipantCounts
};
