const express = require('express');
const router = express.Router();
const tournamentParticipantController = require('../controllers/tournamentParticipantController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', verifyToken, tournamentParticipantController.registerToTournament);
router.get('/my-tournaments', verifyToken, tournamentParticipantController.getMyTournaments);

module.exports = router;
