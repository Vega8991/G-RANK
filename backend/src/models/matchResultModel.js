const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
    tournamentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true
    },
    replayUrl: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^https:\/\/replay\.pokemonshowdown\.com\//.test(v);
            },
            message: 'Must be a valid Pokemon Showdown replay URL'
        }
    },
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    loserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    replayData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    verified: {
        type: Boolean,
        default: false
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

const MatchResult = mongoose.model('MatchResult', matchResultSchema);

module.exports = MatchResult;
