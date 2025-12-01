// Authentication routes
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile (protected route)
router.get('/profile', authenticate, getProfile);

module.exports = router;

