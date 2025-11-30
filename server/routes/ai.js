// AI routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getExplanation,
  generateContent,
  generateQuestions
} = require('../controllers/aiController');

// All routes require authentication
router.use(authenticate);

// Get tutoring explanation
router.post('/explain', getExplanation);

// Generate learning content
router.post('/generate-content', generateContent);

// Generate quiz questions
router.post('/generate-questions', generateQuestions);

module.exports = router;

