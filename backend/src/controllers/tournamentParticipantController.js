const Tournament = require('../models/tournamentModel');
const TournamentParticipant = require('../models/tournamentParticipantModel');
const User = require('../models/userModel');

const registerToTournament = async function(req, res) {
    try{
        const userId = req.userId;
        const tournamentId = req.params.tournamentId;

        const tournament = await Tournament.findById(tournamentId);

        if(!tournament){
            return res.status(404).json({
                success: false,
                message: 'Tournament not found'
            });
        }

        if(tournament.status !== 'open'){
            return res.status(400).json({
                success: false,
                message: 'Tournament is not open for registration'
            });
        }

        const currentDate = new Date();

        if(currentDate > tournament.registrationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed'
            });
        }

        if(tournament.currentParticipants >= tournament.maxParticipants) {
            return res.status(400).json({
                success: false,
                message: 'Tournament is full'
            });
        }

        const existingParticipant = await TournamentParticipant.findOne({
            tournamentId: tournamentId,
            userId: userId
        });

        if(existingParticipant){
            return res.status(400).json({
                success: false,
                message: 'You are already registered in this tournament'
            });
        }

        const user = await User.findById(userId);

        const newParticipant = await TournamentParticipant.create({
            tournamentId: tournamentId,
            userId: userId,
            mmrBefore: user.mmr
        });

        tournament.currentParticipants = tournament.currentParticipants + 1;
        await tournament.save();

        return res.status(201).json({
            success: true,
            message: 'Registered to tournament successfully',
            participant: newParticipant
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: 'Error registering to tournament',
            error: error.message
        });
    }
};

module.exports = {
    registerToTournament
}