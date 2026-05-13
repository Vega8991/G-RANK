const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            username: username,
            email: email,
            password: hashPassword(password),
            emailVerificationToken: verificationToken
        });

        const savedUser = await newUser.save();

        try {
            await sendVerificationEmail(savedUser.email, savedUser.username, verificationToken);
        } catch (emailError) {
            return res.status(500).json({ success: false, message: 'Failed to send verification email' });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                id: savedUser._id,
                username: savedUser.username,
                email: savedUser.email,
                rank: savedUser.rank,
                mmr: savedUser.mmr,
                role: savedUser.role || 'USER'
            }
        });
    } catch (error) {
        let message = 'Error creating user';

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue || {})[0];

            if (duplicateField === 'email') {
                message = 'An account with this email already exists';
            } else if (duplicateField === 'username') {
                message = 'This username is already taken';
            } else {
                message = 'Account already exists';
            }
        } else if (error.name === 'ValidationError') {
            const validationMessages = Object.values(error.errors).map(function (e) { return e.message; });
            message = validationMessages.join(', ');
        }

        res.status(400).json({
            success: false,
            message: message
        });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const foundUser = await User.findOne({ email: email });

        if (!foundUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (!comparePassword(password, foundUser.password)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!foundUser.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in'
            });
        }

        const role = foundUser.role || 'USER';
        const token = jwt.sign(
            { userId: foundUser._id, email: foundUser.email, username: foundUser.username, role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        const decoded = jwt.decode(token);
        const maxAge = (decoded.exp - Math.floor(Date.now() / 1000)) * 1000;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
        });

        res.cookie('auth_info', JSON.stringify({ username: foundUser.username, role, exp: decoded.exp }), {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
        });

        res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

async function getProfile(req, res) {
    try {
        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                rank: user.rank,
                mmr: user.mmr,
                winRate: user.winRate,
                winStreak: user.winStreak,
                wins: user.wins,
                losses: user.losses,
                role: user.role || 'USER',
                riotGameName: user.riotGameName || null,
                riotTagLine: user.riotTagLine || null,
                riotPuuid: user.riotPuuid || null,
                riotPlatform: user.riotPlatform || null,
                riotCachedProfile: user.riotCachedProfile || null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

async function verifyEmail(req, res) {
    try {
        const user = await User.findOne({ emailVerificationToken: req.query.token });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully! You can now login.'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        sendPasswordResetEmail(user.email, user.username, resetToken);

        res.status(200).json({
            success: true,
            message: 'If that email exists, a reset link has been sent.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function resetPassword(req, res) {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Token and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = hashPassword(password);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function getPublicProfile(req, res) {
    try {
        const user = await User.findOne(
            { username: req.params.username },
            '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -email'
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                rank: user.rank,
                mmr: user.mmr,
                wins: user.wins,
                losses: user.losses,
                winRate: user.winRate,
                winStreak: user.winStreak,
                totalMatches: user.totalMatches,
                role: user.role,
                status: user.status,
                createdAt: user.joinDate,
                riotGameName: user.riotGameName || null,
                riotTagLine: user.riotTagLine || null,
                riotPlatform: user.riotPlatform || null,
                riotCachedProfile: user.riotCachedProfile || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

async function resendVerificationEmail(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists and is unverified, a new link has been sent.'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'This email is already verified. You can log in.'
            });
        }

        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = verificationToken;
        await user.save();

        try {
            await sendVerificationEmail(user.email, user.username, verificationToken);
        } catch (emailError) {
            return res.status(500).json({ success: false, message: 'Failed to send verification email' });
        }

        res.status(200).json({ success: true, message: 'Verification email sent. Check your inbox.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

function logoutUser(req, res) {
    res.clearCookie('token',     { httpOnly: true,  secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.clearCookie('auth_info', { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    res.status(200).json({ success: true, message: 'Logged out' });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getPublicProfile,
    resendVerificationEmail
};
