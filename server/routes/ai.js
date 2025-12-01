// AI routes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getExplanation,
  generateContent,
  generateQuestions,
  generateModuleDetails,
  generateIntroduction,
  generateSection
} = require('../controllers/aiController');

// All routes require authentication
router.use(authenticate);

// Get tutoring explanation
router.post('/explain', getExplanation);

// Generate learning content
router.post('/generate-content', generateContent);

// Generate quiz questions
router.post('/generate-questions', generateQuestions);

// Generate detailed module content
router.post('/generate-module', generateModuleDetails);

// Generate introduction content only
router.post('/generate-introduction', generateIntroduction);

// Generate section content only
router.post('/generate-section', generateSection);

module.exports = router;

