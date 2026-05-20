let express = require('express');
let router = express.Router();
let rateLimit = require('express-rate-limit');
let { registerUser, loginUser, logoutUser, getProfile, verifyEmail, forgotPassword, resetPassword, getPublicProfile, resendVerificationEmail, refreshTokens } = require('../controllers/authController');
let { verifyToken } = require('../middlewares/authMiddleware');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts, try again in 15 minutes' },
});

const emailLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many email requests, try again in 1 hour' },
});

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshTokens);
router.get('/profile', verifyToken, getProfile);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', emailLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.get('/users/:username', getPublicProfile);
router.post('/resend-verification', emailLimiter, resendVerificationEmail);

module.exports = router;
