const express = require('express');
const router = express.Router();
const matchResultController = require('../controllers/matchResultController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/submit-replay', verifyToken, matchResultController.submitReplay);
router.get('/tournament/:tournamentId', matchResultController.getTournamentResults);

module.exports = router;