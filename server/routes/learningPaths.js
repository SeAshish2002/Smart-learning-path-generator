// Learning Path routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createLearningPath,
  getUserLearningPaths,
  getLearningPath,
  updateProgress,
  deleteLearningPath
} = require('../controllers/learningPathController');

// All routes require authentication
router.use(authenticate);

// Create new learning path
router.post('/', createLearningPath);

// Get all learning paths for current user
router.get('/', getUserLearningPaths);

// Get specific learning path
router.get('/:id', getLearningPath);

// Update learning path progress
router.put('/:id/progress', updateProgress);

// Delete learning path
router.delete('/:id', deleteLearningPath);

module.exports = router;

