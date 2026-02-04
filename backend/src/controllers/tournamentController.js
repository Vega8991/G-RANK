const Tournament = require('../models/tournamentModel');

const createTournament = async function (req, res) {
    try {
        const userId = req.userId;

        const tournamentData = {
            name: req.body.name,
            game: req.body.game,
            description: req.body.description,
            registrationDeadline: req.body.registrationDeadline,
            matchDateTime: req.body.matchDateTime,
            maxParticipants: req.body.maxParticipants,
            prizePool: req.body.prizePool || 0,
            createdBy: userId
        };

        const newTournament = await Tournament.create(tournamentData);

        return res.status(201).json({
            success: true,
            message: 'Tournament created successfully',
            tournament: newTournament
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating tournament',
            error: error.message
        });
    }
};

const getAllTournaments = async function (req, res) {
    try {
        const tournaments = await Tournament.find({ status: 'open' })
            .populate('createdBy', 'username')
            .sort({ matchDateTime: 1 });

        return res.status(200).json({
            success: true,
            tournaments: tournaments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching tournaments',
            error: error.message
        });
    }
};

const getTournamentById = async function (req, res) {
    try {
        const tournamentId = req.params.id;

        const tournament = await Tournament.findById(tournamentId)
            .populate('createdBy', 'username');

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        return res.status(200).json({
            success: true,
            tournament: tournament
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching tournament',
            error: error.message
        });
    }
};

const getMyCreatedTournaments = async function (req, res) {
    try {
        const userId = req.userId;

        const tournaments = await Tournament.find({ createdBy: userId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            tournaments: tournaments
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching your tournaments',
            error: error.message
        });
    }
};

module.exports = {
    createTournament,
    getAllTournaments,
    getTournamentById,
    getMyCreatedTournaments
};
