const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

async function registerUser(req, res) {
    try {
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

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

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');

        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            emailVerificationToken: verificationToken
        });

        const savedUser = await newUser.save();

        try {
            sendVerificationEmail(savedUser.email, savedUser.username, verificationToken);
        } catch (emailError) {
            console.log('Warning: could not send verification email:', emailError.message);
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
            // MongoDB duplicate key error — figure out which field is duplicated
            const duplicateField = Object.keys(error.keyValue || {})[0];

            if (duplicateField === 'email') {
                message = 'An account with this email already exists';
            } else if (duplicateField === 'username') {
                message = 'This username is already taken';
            } else {
                message = 'Account already exists';
            }
        } else if (error.name === 'ValidationError') {
            // Mongoose validation error — combine all error messages into one string
            const validationMessages = Object.values(error.errors).map(function (e) { return e.message; });
            message = validationMessages.join(', ');
        }

        res.status(400).json({
            success: false,
            message: message,
            error: error.message
        });
    }
}

async function loginUser(req, res) {
    try {
        const email = req.body.email;
        const password = req.body.password;

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

        const isPasswordValid = bcrypt.compareSync(password, foundUser.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        if (!foundUser.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in'
            });
        }

        const secretKey = process.env.JWT_SECRET;
        const expirationTime = process.env.JWT_EXPIRE;

        const token = jwt.sign(
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
        const userId = req.userId;
        const user = await User.findById(userId);

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
            message: 'Server error',
            error: error.message
        });
    }
}

async function verifyEmail(req, res) {
    try {
        const token = req.query.token;
        const user = await User.findOne({ emailVerificationToken: token });

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
            message: 'Server error',
            error: error.message
        });
    }
}

async function forgotPassword(req, res) {
    try {
        const email = req.body.email;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email: email });

        // We always return the same message whether the email exists or not.
        // This prevents attackers from discovering which emails are registered.
        if (!user) {
            return res.status(200).json({
                success: true,
                message: 'If that email exists, a reset link has been sent.'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // expires in 1 hour
        await user.save();

        sendPasswordResetEmail(user.email, user.username, resetToken);

        res.status(200).json({
            success: true,
            message: 'If that email exists, a reset link has been sent.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

async function resetPassword(req, res) {
    try {
        const token = req.body.token;
        const password = req.body.password;

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

        // Find the user who owns this reset token, and only if it hasn't expired yet
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: new Date() } // $gt means "greater than" — token must still be in the future
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now log in.'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

async function getPublicProfile(req, res) {
    try {
        const username = req.params.username;

        // Fetch user but exclude sensitive fields
        const user = await User.findOne(
            { username: username },
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
                createdAt: user.joinDate || user.createdAt,
                riotGameName: user.riotGameName || null,
                riotTagLine: user.riotTagLine || null,
                riotPlatform: user.riotPlatform || null,
                riotCachedProfile: user.riotCachedProfile || null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

async function resendVerificationEmail(req, res) {
    try {
        const email = req.body.email;

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
            sendVerificationEmail(user.email, user.username, verificationToken);
        } catch (emailError) {
            console.log('Warning: could not send verification email:', emailError.message);
        }

        res.status(200).json({ success: true, message: 'Verification email sent. Check your inbox.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    getProfile,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getPublicProfile,
    resendVerificationEmail
};
