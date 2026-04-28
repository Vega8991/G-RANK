const User  = require('../models/userModel');
const Lobby = require('../models/lobbyModel');
const bcrypt = require('bcryptjs');

// ─── Users ─────────────────────────────────────────────────────────────────────

async function getAllUsers(req, res) {
    try {
        const users = await User.find({}, '-password -emailVerificationToken').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
}

async function createUser(req, res) {
    try {
        const { username, email, password, role, rank, mmr, status } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, message: 'username, email and password required' });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashed = bcrypt.hashSync(password, salt);
        const user = new User({
            username,
            email,
            password: hashed,
            role: role || 'USER',
            rank: rank || 'Bronze',
            mmr: mmr ?? 250,
            status: status || 'active',
            isEmailVerified: true
        });
        const saved = await user.save();
        res.status(201).json({
            success: true,
            user: { _id: saved._id, username: saved.username, email: saved.email, role: saved.role, rank: saved.rank, mmr: saved.mmr, status: saved.status, createdAt: saved.createdAt }
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

async function updateUser(req, res) {
    try {
        const { username, email, role, rank, mmr, status, password } = req.body;
        const update = {};
        if (username !== undefined) update.username = username;
        if (email    !== undefined) update.email    = email;
        if (role     !== undefined) update.role     = role;
        if (rank     !== undefined) update.rank     = rank;
        if (mmr      !== undefined) update.mmr      = mmr;
        if (status   !== undefined) update.status   = status;
        if (password) {
            const salt = bcrypt.genSaltSync(10);
            update.password = bcrypt.hashSync(password, salt);
        }
        const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: '-password -emailVerificationToken' });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

async function deleteUser(req, res) {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ─── Lobbies ───────────────────────────────────────────────────────────────────

async function adminGetAllLobbies(req, res) {
    try {
        const lobbies = await Lobby.find().populate('createdBy', 'username').sort({ createdAt: -1 });
        res.json({ success: true, lobbies });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

async function adminUpdateLobby(req, res) {
    try {
        const { name, description, game, maxParticipants, status, prizePool, registrationDeadline, matchDateTime } = req.body;
        const update = {};
        if (name                !== undefined) update.name                = name;
        if (description         !== undefined) update.description         = description;
        if (game                !== undefined) update.game                = game;
        if (maxParticipants     !== undefined) update.maxParticipants     = maxParticipants;
        if (status              !== undefined) update.status              = status;
        if (prizePool           !== undefined) update.prizePool           = prizePool;
        if (registrationDeadline !== undefined) update.registrationDeadline = registrationDeadline;
        if (matchDateTime       !== undefined) update.matchDateTime       = matchDateTime;
        const lobby = await Lobby.findByIdAndUpdate(req.params.id, update, { new: true }).populate('createdBy', 'username');
        if (!lobby) return res.status(404).json({ success: false, message: 'Lobby not found' });
        res.json({ success: true, lobby });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
}

async function adminDeleteLobby(req, res) {
    try {
        const lobby = await Lobby.findByIdAndDelete(req.params.id);
        if (!lobby) return res.status(404).json({ success: false, message: 'Lobby not found' });
        res.json({ success: true, message: 'Lobby deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

// ─── Stats ─────────────────────────────────────────────────────────────────────

async function getStats(req, res) {
    try {
        const [totalUsers, totalLobbies, activeLobbies, suspendedUsers] = await Promise.all([
            User.countDocuments(),
            Lobby.countDocuments(),
            Lobby.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
            User.countDocuments({ status: 'suspended' })
        ]);
        res.json({ success: true, stats: { totalUsers, totalLobbies, activeLobbies, suspendedUsers } });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = { getAllUsers, createUser, updateUser, deleteUser, adminGetAllLobbies, adminUpdateLobby, adminDeleteLobby, getStats };
