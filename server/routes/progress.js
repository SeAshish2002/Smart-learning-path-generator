// Progress routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getUserProgress,
  getProgressAnalytics,
  getLearningPathProgress
} = require('../controllers/progressController');

// All routes require authentication
router.use(authenticate);

// Get all progress for current user
router.get('/', getUserProgress);

// Get progress analytics (for dashboard)
router.get('/analytics', getProgressAnalytics);

// Get progress for specific learning path
router.get('/learning-path/:learningPathId', getLearningPathProgress);

module.exports = router;

