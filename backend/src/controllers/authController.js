let User = require('../models/userModel');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

async function registerUser(req, res) {
    try {
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.password;

        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(password, salt);

        let newUser = new User({
            username: username,
            email: email,
            password: hashedPassword
        });

        let savedUser = await newUser.save();

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
                winStreak: foundUser.winStreak
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

module.exports = { registerUser, loginUser };
