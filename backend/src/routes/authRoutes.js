let express = require('express');
let router = express.Router();
let { registerUser, loginUser, getProfile, verifyEmail } = require('../controllers/authController');
let { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getProfile);
router.get('/verify-email', verifyEmail);

module.exports = router;
