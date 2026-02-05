const express = require('express');
const router = express.Router();
const tournamentParticipantController = require('../controllers/tournamentParticipantController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register/:tournamentId', verifyToken, tournamentParticipantController.registerToTournament);

module.exports = router;