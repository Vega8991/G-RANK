const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, lobbyController.createLobby);
router.get('/', lobbyController.getAllLobbies);
router.get('/my-created', verifyToken, lobbyController.getMyCreatedLobbies);
router.post('/sync-counts', lobbyController.syncParticipantCounts);
router.get('/:id', lobbyController.getLobbyById);
router.patch('/:id/status', verifyToken, lobbyController.updateLobbyStatus);

module.exports = router;

