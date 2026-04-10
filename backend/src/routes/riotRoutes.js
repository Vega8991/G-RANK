const express = require('express');
const router = express.Router();
const riotController = require('../controllers/riotController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Account linking (authenticated)
router.post('/link',   verifyToken, riotController.linkRiotAccount);
router.delete('/unlink', verifyToken, riotController.unlinkRiotAccount);

// Profile lookups
router.get('/profile',       verifyToken, riotController.getMyRiotProfile);
router.get('/profile/:riotId', riotController.getRiotProfileByRiotId); // public, ?platform=na1

// Match submission (authenticated)
router.post('/submit-lol-match',       verifyToken, riotController.submitLolMatch);
router.post('/submit-valorant-match',  verifyToken, riotController.submitValorantMatch);

module.exports = router;
