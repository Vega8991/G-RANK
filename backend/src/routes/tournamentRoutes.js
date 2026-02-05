const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/create', verifyToken, tournamentController.createTournament);
router.get('/all', tournamentController.getAllTournaments);
router.get('/my-created', verifyToken, tournamentController.getMyCreatedTournaments);
router.get('/:id', tournamentController.getTournamentById);

module.exports = router;