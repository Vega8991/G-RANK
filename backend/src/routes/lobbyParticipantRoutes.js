const express = require('express');
const router = express.Router();
const lobbyParticipantController = require('../controllers/lobbyParticipantController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', verifyToken, lobbyParticipantController.registerToLobby);
router.post('/leave', verifyToken, lobbyParticipantController.leaveLobby);
router.get('/my-lobbies', verifyToken, lobbyParticipantController.getMyLobbies);

module.exports = router;
