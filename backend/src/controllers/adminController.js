const User  = require('../models/userModel');
const Lobby = require('../models/lobbyModel');
const { hashPassword } = require('../utils/passwordUtils');

const VALID_ROLES    = ['USER', 'ADMIN'];
const VALID_RANKS    = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Elite'];
const VALID_STATUSES = ['active', 'suspended', 'banned'];
const VALID_LOBBY_STATUSES = ['open', 'pending', 'in_progress', 'completed', 'cancelled'];
const VALID_GAMES    = ['pokemon_showdown', 'league_of_legends']; // valorant not yet supported

async function getAllUsers(req, res) {
    try {
        const users = await User.find({}, '-password -emailVerificationToken').sort({ createdAt: -1 });
        res.json({ success: true, users: users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

async function createUser(req, res) {
    try {
        const { username, email, password, role, rank, mmr, status } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'username, email and password are required'
            });
        }

        const resolvedRole   = role   || 'USER';
        const resolvedRank   = rank   || 'Bronze';
        const resolvedStatus = status || 'active';
        const resolvedMmr    = mmr !== undefined ? parseInt(mmr) : 250;

        if (!VALID_ROLES.includes(resolvedRole)) {
            return res.status(400).json({ success: false, message: `Invalid role. Valid values: ${VALID_ROLES.join(', ')}` });
        }
        if (!VALID_RANKS.includes(resolvedRank)) {
            return res.status(400).json({ success: false, message: `Invalid rank. Valid values: ${VALID_RANKS.join(', ')}` });
        }
        if (!VALID_STATUSES.includes(resolvedStatus)) {
            return res.status(400).json({ success: false, message: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` });
        }
        if (isNaN(resolvedMmr) || resolvedMmr < 0 || resolvedMmr > 99999) {
            return res.status(400).json({ success: false, message: 'MMR must be a number between 0 and 99999' });
        }

        const newUser = new User({
            username: username,
            email: email,
            password: hashPassword(password),
            role: resolvedRole,
            rank: resolvedRank,
            mmr: resolvedMmr,
            status: resolvedStatus,
            isEmailVerified: true
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

async function updateUser(req, res) {
    try {
        const fieldsToUpdate = {};

        if (req.body.username !== undefined) fieldsToUpdate.username = req.body.username;
        if (req.body.email    !== undefined) fieldsToUpdate.email    = req.body.email;

        if (req.body.role !== undefined) {
            if (!VALID_ROLES.includes(req.body.role)) {
                return res.status(400).json({ success: false, message: `Invalid role. Valid values: ${VALID_ROLES.join(', ')}` });
            }
            fieldsToUpdate.role = req.body.role;
        }

        if (req.body.rank !== undefined) {
            if (!VALID_RANKS.includes(req.body.rank)) {
                return res.status(400).json({ success: false, message: `Invalid rank. Valid values: ${VALID_RANKS.join(', ')}` });
            }
            fieldsToUpdate.rank = req.body.rank;
        }

        if (req.body.mmr !== undefined) {
            const mmrVal = parseInt(req.body.mmr);
            if (isNaN(mmrVal) || mmrVal < 0 || mmrVal > 99999) {
                return res.status(400).json({ success: false, message: 'MMR must be a number between 0 and 99999' });
            }
            fieldsToUpdate.mmr = mmrVal;
        }

        if (req.body.status !== undefined) {
            if (!VALID_STATUSES.includes(req.body.status)) {
                return res.status(400).json({ success: false, message: `Invalid status. Valid values: ${VALID_STATUSES.join(', ')}` });
            }
            fieldsToUpdate.status = req.body.status;
        }

        if (req.body.password) {
            fieldsToUpdate.password = hashPassword(req.body.password);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            fieldsToUpdate,
            {
                new: true,
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

async function adminUpdateLobby(req, res) {
    try {
        const fieldsToUpdate = {};

        if (req.body.name        !== undefined) fieldsToUpdate.name        = req.body.name;
        if (req.body.description !== undefined) fieldsToUpdate.description = req.body.description;
        if (req.body.prizePool   !== undefined) fieldsToUpdate.prizePool   = req.body.prizePool;
        if (req.body.registrationDeadline !== undefined) fieldsToUpdate.registrationDeadline = req.body.registrationDeadline;
        if (req.body.matchDateTime        !== undefined) fieldsToUpdate.matchDateTime        = req.body.matchDateTime;

        if (req.body.game !== undefined) {
            if (!VALID_GAMES.includes(req.body.game)) {
                return res.status(400).json({ success: false, message: `Invalid game. Valid values: ${VALID_GAMES.join(', ')}` });
            }
            fieldsToUpdate.game = req.body.game;
        }

        if (req.body.maxParticipants !== undefined) {
            const mp = parseInt(req.body.maxParticipants);
            if (isNaN(mp) || mp < 2 || mp > 100) {
                return res.status(400).json({ success: false, message: 'maxParticipants must be between 2 and 100' });
            }
            fieldsToUpdate.maxParticipants = mp;
        }

        if (req.body.status !== undefined) {
            if (!VALID_LOBBY_STATUSES.includes(req.body.status)) {
                return res.status(400).json({ success: false, message: `Invalid status. Valid values: ${VALID_LOBBY_STATUSES.join(', ')}` });
            }
            fieldsToUpdate.status = req.body.status;
        }

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

async function getStats(req, res) {
    try {
        const [totalUsers, totalLobbies, activeLobbies, suspendedUsers] = await Promise.all([
            User.countDocuments(),
            Lobby.countDocuments(),
            Lobby.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
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
