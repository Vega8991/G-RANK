let User = require('../models/userModel');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let crypto = require('crypto');
let { sendVerificationEmail } = require('../services/emailService');

async function registerUser(req, res) {
    try {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;

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
                mmr: savedUser.mmr
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
                username: foundUser.username
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
                losses: foundUser.losses
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
                losses: user.losses
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

module.exports = { registerUser, loginUser, getProfile, verifyEmail };
