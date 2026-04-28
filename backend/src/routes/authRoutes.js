let express = require('express');
let router = express.Router();
let { registerUser, loginUser, getProfile, verifyEmail, forgotPassword, resetPassword, getPublicProfile } = require('../controllers/authController');
let { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', verifyToken, getProfile);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users/:username', getPublicProfile);

module.exports = router;
