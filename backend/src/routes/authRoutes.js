let express = require('express');
let router = express.Router();
let { registerUser, loginUser, getProfile } = require('../controllers/authController');
let { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
