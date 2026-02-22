const mongoose = require('mongoose');

const lobbyParticipantSchema = new mongoose.Schema({
    lobbyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lobby',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['registered', 'played', 'verified', 'disqualified'],
        default: 'registered'
    },
    hasSubmittedResults: {
        type: Boolean,
        default: false
    },
    finalPosition: {
        type: Number,
        default: null
    },
    mmrBefore: {
        type: Number,
        required: true
    },
    mmrAfter: {
        type: Number,
        default: null
    },
    mmrChange: {
        type: Number,
        default: 0
    }
});

lobbyParticipantSchema.index({ lobbyId: 1, userId: 1 }, { unique: true });

const LobbyParticipant = mongoose.model('LobbyParticipant', lobbyParticipantSchema);

module.exports = LobbyParticipant;
