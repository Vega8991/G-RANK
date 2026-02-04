const mongoose = require('mongoose');

const tournamentParticipantSchema = new mongoose.Schema({
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

const TournamentParticipant = mongoose.model('TournamentParticipant', tournamentParticipantSchema);

module.exports = TournamentParticipant;
