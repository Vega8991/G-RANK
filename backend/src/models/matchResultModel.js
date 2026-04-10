const mongoose = require('mongoose');

const matchResultSchema = new mongoose.Schema({
    lobbyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lobby',
        required: true
    },
    game: {
        type: String,
        enum: ['pokemon_showdown', 'league_of_legends', 'valorant'],
        default: 'pokemon_showdown'
    },
    replayUrl: {
        type: String,
        default: null,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^https:\/\/replay\.pokemonshowdown\.com\//.test(v);
            },
            message: 'Must be a valid Pokemon Showdown replay URL'
        }
    },
    matchId: {
        type: String,
        default: null
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
