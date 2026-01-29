let User = require('../models/userModel');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');

function registerUser(req, res) {
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

    newUser.save((err, savedUser) => {
        if(err){
            res.status(400).json({
                success: false,
                message: 'Error creating user',
                error: error.message
            });
            return;
        }

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
    });
}