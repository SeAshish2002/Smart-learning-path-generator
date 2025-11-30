// User routes
const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate } = require('../middleware/auth');

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, learningStyle, currentLevel } = req.body;
    const user = await User.findByPk(req.user.id);

    if (name) user.name = name;
    if (learningStyle) user.learningStyle = learningStyle;
    if (currentLevel) user.currentLevel = currentLevel;

    await user.save();

    res.json({
      message: 'Profile updated successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        learningStyle: user.learningStyle,
        currentLevel: user.currentLevel
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.', error: error.message });
  }
});

module.exports = router;

