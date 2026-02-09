const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    game: {
        type: String,
        required: true,
        enum: ['pokemon_showdown'],
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
        enum: ['open', 'pending', 'completed', 'cancelled'],
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
        type: Number,
        default: 0
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

const Tournament = mongoose.model('Tournament', tournamentSchema);

module.exports = Tournament;
