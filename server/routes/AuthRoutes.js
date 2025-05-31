const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/AuthController');
const { loginUser } = require('../controllers/AuthController');

// Registro de usuarios
router.post('/register', registerUser);

// Login de usuarios (solo placeholder)
router.post('/login', loginUser);

module.exports = router;
