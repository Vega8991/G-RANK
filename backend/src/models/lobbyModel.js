const mongoose = require('mongoose');

const lobbySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true,
        enum: ['pokemon_showdown', 'league_of_legends', 'valorant'],
        default: 'pokemon_showdown'
    },
    description: {
        type: String,
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: true
    },
    matchDateTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'pending', 'in_progress', 'completed', 'cancelled'],
        default: 'open'
    },
    maxParticipants: {
        type: Number,
        required: true
    },
    currentParticipants: {
        type: Number,
        default: 0
    },
    prizePool: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Lobby = mongoose.model('Lobby', lobbySchema);

module.exports = Lobby;
