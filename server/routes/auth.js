// Authentication routes
const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { register, login, getProfile, oauthCallback } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile (protected route)
router.get('/profile', authenticate, getProfile);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  oauthCallback
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  oauthCallback
);

module.exports = router;

