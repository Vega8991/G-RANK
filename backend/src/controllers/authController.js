let User = require('../models/userModel');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');
let { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

async function registerUser(req, res) {
    try {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;

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

        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);

        let verificationToken = crypto.randomBytes(32).toString('hex');

        let newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            emailVerificationToken: verificationToken
        });

        let savedUser = await newUser.save();
        sendVerificationEmail(savedUser.email, savedUser.username, verificationToken);

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
        res.status(400).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
}

async function loginUser(req, res) {
    try {
        let email = req.body.email;
        let password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        let foundUser = await User.findOne({ email: email });

        if (!foundUser) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

                let isPasswordValid = bcrypt.compareSync(password, foundUser.password);

        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
            return;
        }

        if (!foundUser.isEmailVerified) {
            res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in'
            });
            return;
        }

        let secretKey = process.env.JWT_SECRET;
        let expirationTime = process.env.JWT_EXPIRE;

        let token = jwt.sign(
            {
                userId: foundUser._id,
                email: foundUser.email,
                username: foundUser.username,
                role: foundUser.role || 'USER'
            },
            secretKey,
            { expiresIn: expirationTime }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email,
                rank: foundUser.rank,
                mmr: foundUser.mmr,
                winRate: foundUser.winRate,
                winStreak: foundUser.winStreak,
                wins: foundUser.wins,
                losses: foundUser.losses,
                role: foundUser.role || 'USER'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

async function getProfile(req, res) {
    try {
        let userId = req.userId;
        let user = await User.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
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
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message
        });
    }
}

async function verifyEmail(req, res) {
    try {
        let token = req.query.token;
        let user = await User.findOne({ emailVerificationToken: token });

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
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
            message: 'Server error',
            error: error.message
        });
    }
}

async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await user.save();

        sendPasswordResetEmail(user.email, user.username, resetToken);

        res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

async function resetPassword(req, res) {
    try {
        const { token, password } = req.body;
        if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password are required' });
        if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() }
        });

        if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });

        const salt = await require('bcryptjs').genSalt(10);
        user.password = await require('bcryptjs').hash(password, salt);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

async function getPublicProfile(req, res) {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username }, '-password -emailVerificationToken -passwordResetToken -passwordResetExpires -email');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

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
                createdAt: user.joinDate || user.createdAt,
                riotGameName: user.riotGameName || null,
                riotTagLine: user.riotTagLine || null,
                riotPlatform: user.riotPlatform || null,
                riotCachedProfile: user.riotCachedProfile || null,
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

module.exports = { registerUser, loginUser, getProfile, verifyEmail, forgotPassword, resetPassword, getPublicProfile };
