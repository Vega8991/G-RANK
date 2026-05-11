const User  = require('../models/userModel');
const Lobby = require('../models/lobbyModel');
const bcrypt = require('bcryptjs');

// Get all users (excluding password and sensitive tokens)
async function getAllUsers(req, res) {
    try {
        const users = await User.find({}, '-password -emailVerificationToken').sort({ createdAt: -1 });
        res.json({ success: true, users: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

// Create a new user directly (admin only — skips the normal email verification flow)
async function createUser(req, res) {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;
        const role = req.body.role;
        const rank = req.body.rank;
        const mmr = req.body.mmr;
        const status = req.body.status;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'username, email and password are required'
            });
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            role: role || 'USER',
            rank: rank || 'Bronze',
            mmr: mmr !== undefined ? mmr : 250,
            status: status || 'active',
            isEmailVerified: true // admin-created users skip email verification
        });

        const savedUser = await newUser.save();

        res.status(201).json({
            success: true,
            user: {
                _id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                role: savedUser.role,
                rank: savedUser.rank,
                mmr: savedUser.mmr,
                status: savedUser.status,
                createdAt: savedUser.createdAt
            }
        });
    } catch (err) {
        let message = err.message;

        if (err.code === 11000) {
            // MongoDB duplicate key error
            const duplicateField = Object.keys(err.keyValue || {})[0];
            if (duplicateField === 'email') {
                message = 'Email already in use';
            } else if (duplicateField === 'username') {
                message = 'Username already taken';
            } else {
                message = 'Duplicate value';
            }
        }

        res.status(400).json({ success: false, message: message });
    }
}

// Update a user's fields. Only the fields sent in the request body are changed.
async function updateUser(req, res) {
    try {
        const fieldsToUpdate = {};

        // Only include a field if it was actually sent in the request
        if (req.body.username !== undefined) fieldsToUpdate.username = req.body.username;
        if (req.body.email    !== undefined) fieldsToUpdate.email    = req.body.email;
        if (req.body.role     !== undefined) fieldsToUpdate.role     = req.body.role;
        if (req.body.rank     !== undefined) fieldsToUpdate.rank     = req.body.rank;
        if (req.body.mmr      !== undefined) fieldsToUpdate.mmr      = req.body.mmr;
        if (req.body.status   !== undefined) fieldsToUpdate.status   = req.body.status;

        // Hash the new password if one was provided
        if (req.body.password) {
            const salt = bcrypt.genSaltSync(10);
            fieldsToUpdate.password = bcrypt.hashSync(req.body.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            fieldsToUpdate,
            {
                new: true, // return the updated document instead of the old one
                select: '-password -emailVerificationToken'
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: updatedUser });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Permanently delete a user
async function deleteUser(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Get all lobbies
async function adminGetAllLobbies(req, res) {
    try {
        const lobbies = await Lobby.find()
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json({ success: true, lobbies: lobbies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Update a lobby's fields. Only the fields sent in the request body are changed.
async function adminUpdateLobby(req, res) {
    try {
        const fieldsToUpdate = {};

        if (req.body.name                !== undefined) fieldsToUpdate.name                = req.body.name;
        if (req.body.description         !== undefined) fieldsToUpdate.description         = req.body.description;
        if (req.body.game                !== undefined) fieldsToUpdate.game                = req.body.game;
        if (req.body.maxParticipants     !== undefined) fieldsToUpdate.maxParticipants     = req.body.maxParticipants;
        if (req.body.status              !== undefined) fieldsToUpdate.status              = req.body.status;
        if (req.body.prizePool           !== undefined) fieldsToUpdate.prizePool           = req.body.prizePool;
        if (req.body.registrationDeadline !== undefined) fieldsToUpdate.registrationDeadline = req.body.registrationDeadline;
        if (req.body.matchDateTime       !== undefined) fieldsToUpdate.matchDateTime       = req.body.matchDateTime;

        const updatedLobby = await Lobby.findByIdAndUpdate(
            req.params.id,
            fieldsToUpdate,
            { new: true }
        ).populate('createdBy', 'username');

        if (!updatedLobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }

        res.json({ success: true, lobby: updatedLobby });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

// Permanently delete a lobby
async function adminDeleteLobby(req, res) {
    try {
        const deletedLobby = await Lobby.findByIdAndDelete(req.params.id);
        if (!deletedLobby) {
            return res.status(404).json({ success: false, message: 'Lobby not found' });
        }
        res.json({ success: true, message: 'Lobby deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// Get dashboard stats for the admin panel
async function getStats(req, res) {
    try {
        // Run all four database counts at the same time for speed
        const [totalUsers, totalLobbies, activeLobbies, suspendedUsers] = await Promise.all([
            User.countDocuments(),
            Lobby.countDocuments(),
            Lobby.countDocuments({ status: { $in: ['open', 'in_progress'] } }), // $in = "any of these values"
            User.countDocuments({ status: 'suspended' })
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers: totalUsers,
                totalLobbies: totalLobbies,
                activeLobbies: activeLobbies,
                suspendedUsers: suspendedUsers
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    adminGetAllLobbies,
    adminUpdateLobby,
    adminDeleteLobby,
    getStats
};
