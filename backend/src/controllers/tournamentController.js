const Tournament = require('../models/tournamentModel');
const TournamentParticipant = require('../models/tournamentParticipantModel');

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

const getAllTournaments = async (req, res) => {
    try {
        const tournaments = await Tournament.find();

        const tournamentsWithCount = await Promise.all(
            tournaments.map(async (tournament) => {
                const count = await TournamentParticipant.countDocuments({
                    tournamentId: tournament._id
                });
                tournament.currentParticipants = count;
                return tournament;
            })
        );

        return res.status(200).json({
            success: true,
            tournaments: tournamentsWithCount
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

const updateTournamentStatus = async function (req, res) {
    try {
        const userId = req.userId;
        const tournamentId = req.params.id;
        const { status } = req.body;

        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        if (tournament.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the tournament creator can update its status'
            });
        }

        const validStatuses = ['open', 'pending', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be: open, pending, completed, or cancelled'
            });
        }

        tournament.status = status;
        await tournament.save();

        return res.status(200).json({
            success: true,
            message: 'Tournament status updated successfully',
            tournament: tournament
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating tournament status',
            error: error.message
        });
    }
};


module.exports = {
    createTournament,
    getAllTournaments,
    getTournamentById,
    getMyCreatedTournaments,
    updateTournamentStatus
};
