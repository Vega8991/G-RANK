let express = require('express');
let router = express.Router();
let authController = require('../controllers/authController');

router.post('/register', authController.registerUser);

router.post('/login', authController.loginUser);

module.exports = router;