let express = require('express');
let router = express.Router();
let { registerUser, loginUser, logoutUser, getProfile, verifyEmail, forgotPassword, resetPassword, getPublicProfile, resendVerificationEmail } = require('../controllers/authController');
let { verifyToken } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', verifyToken, getProfile);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/users/:username', getPublicProfile);
router.post('/resend-verification', resendVerificationEmail);

module.exports = router;
