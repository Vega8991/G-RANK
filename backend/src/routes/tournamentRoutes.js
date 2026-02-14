const express = require('express');
const router = express.Router();
const tournamentController = require('../controllers/tournamentController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, tournamentController.createTournament);
router.get('/', tournamentController.getAllTournaments);
router.get('/my-created', verifyToken, tournamentController.getMyCreatedTournaments);
router.get('/:id', tournamentController.getTournamentById);
router.patch('/:id/status', verifyToken, tournamentController.updateTournamentStatus);

module.exports = router;

