const express = require('express');
const router = express.Router();
const lobbyParticipantController = require('../controllers/lobbyParticipantController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', verifyToken, lobbyParticipantController.registerToLobby);
router.get('/my-lobbies', verifyToken, lobbyParticipantController.getMyLobbies);

module.exports = router;
