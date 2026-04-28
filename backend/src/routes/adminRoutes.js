const express = require('express');
const router  = express.Router();
const { verifyToken }  = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/adminMiddleware');
const ctrl = require('../controllers/adminController');

const auth = [verifyToken, requireAdmin];

router.get('/stats',           ...auth, ctrl.getStats);
router.get('/users',           ...auth, ctrl.getAllUsers);
router.post('/users',          ...auth, ctrl.createUser);
router.patch('/users/:id',     ...auth, ctrl.updateUser);
router.delete('/users/:id',    ...auth, ctrl.deleteUser);
router.get('/lobbies',         ...auth, ctrl.adminGetAllLobbies);
router.patch('/lobbies/:id',   ...auth, ctrl.adminUpdateLobby);
router.delete('/lobbies/:id',  ...auth, ctrl.adminDeleteLobby);

module.exports = router;
