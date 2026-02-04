const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: String,
        required: true,
        enum: ['rocket_league', 'pokemon_showdown', 'valorant']
    },
    statsData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    proofImageUrl: {
        type: String,
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    verifiedByAI: {
        type: Boolean,
        default: false
    },
    aiVerificationResult: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    isWinner: {
        type: Boolean,
        default: false
    },
    verifiedAt: {
        type: Date,
        default: null
    }
});

const MatchResult = mongoose.model('MatchResult', matchResultSchema);

module.exports = MatchResult;
