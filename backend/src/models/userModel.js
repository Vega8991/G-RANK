let mongoose = require('mongoose');

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        default: 'Bronze'
    },
    mmr: {
        type: Number,
        default: 250
    },

    winRate: {
        type: Number,
        default: 0
    },

    winStreak: {
        type: Number,
        default: 0
    },

    country: {
        type: String,
        default: ''
    },

    joinDate: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String,
        default: 'active'
    },

    totalMatches: {
        type: Number,
        default: 0
    },

    wins: {
        type: Number,
        default: 0
    },
    
    losses: {
        type: Number,
        default: 0
    },
    
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        default: null
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
});

let User = mongoose.model('User', userSchema);

module.exports = User;