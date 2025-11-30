// Quiz routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  createQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz
} = require('../controllers/quizController');

// All routes require authentication
router.use(authenticate);

// Create new quiz
router.post('/', createQuiz);

// Get all quizzes for a learning path
router.get('/learning-path/:learningPathId', getQuizzes);

// Get specific quiz
router.get('/:id', getQuiz);

// Submit quiz answers
router.post('/:id/submit', submitQuiz);

module.exports = router;

