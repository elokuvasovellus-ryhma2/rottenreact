const express = require('express');
const AuthController = require('./authController');

const router = express.Router();

// Register
router.post('/register', AuthController.register);

// Login
router.post('/login', AuthController.login);

module.exports = router;
