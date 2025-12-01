// Learning Path Controller - manages personalized learning paths
const { LearningPath, User } = require('../models');
const { generateLearningContent } = require('../services/aiService');

// Create a new learning path (AI-generated)
const createLearningPath = async (req, res) => {
  try {
    const { subject, topic, difficulty } = req.body;
    const userId = req.user.id;

    // Get user's learning style
    const user = await User.findByPk(userId);
    
    // Generate content using AI
    const aiContent = await generateLearningContent(
      topic || subject,
      difficulty || user.currentLevel === 1 ? 'beginner' : 'intermediate',
      user.learningStyle
    );

    // Validate and log AI content for debugging
    console.log('AI Generated Content:', JSON.stringify(aiContent, null, 2));
    
    // Ensure modules have proper content
    if (aiContent.modules && Array.isArray(aiContent.modules)) {
      aiContent.modules = aiContent.modules.map((module, index) => {
        if (!module.content || module.content.trim().length < 10) {
          console.warn(`Module ${index + 1} has empty or short content, adding default`);
          module.content = `${module.title}: This module provides comprehensive coverage of key concepts, practical examples, and hands-on exercises to help you master this topic.`;
        }
        return module;
      });
    }

    // Create learning path
    const learningPath = await LearningPath.create({
      userId,
      title: aiContent.title || `${subject} Learning Path`,
      description: aiContent.description || `Personalized learning path for ${subject}`,
      subject: subject || 'General',
      difficulty: difficulty || 'beginner',
      content: aiContent,
      progress: 0
    });

    res.status(201).json({
      message: 'Learning path created successfully!',
      learningPath
    });
  } catch (error) {
    console.error('Error creating learning path:', error);
    res.status(500).json({ message: 'Error creating learning path.', error: error.message });
  }
};

// Get all learning paths for a user
const getUserLearningPaths = async (req, res) => {
  try {
    const userId = req.user.id;
    const learningPaths = await LearningPath.findAll({
      where: { userId, isActive: true },
      order: [['createdAt', 'DESC']]
    });

    res.json({ learningPaths });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching learning paths.', error: error.message });
  }
};

// Get a specific learning path
const getLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const learningPath = await LearningPath.findOne({
      where: { id, userId }
    });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found.' });
    }

    res.json({ learningPath });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching learning path.', error: error.message });
  }
};

// Update learning path progress
const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress } = req.body;
    const userId = req.user.id;

    const learningPath = await LearningPath.findOne({
      where: { id, userId }
    });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found.' });
    }

    learningPath.progress = Math.min(100, Math.max(0, progress));
    await learningPath.save();

    res.json({
      message: 'Progress updated successfully!',
      learningPath
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress.', error: error.message });
  }
};

// Delete learning path
const deleteLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const learningPath = await LearningPath.findOne({
      where: { id, userId }
    });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found.' });
    }

    learningPath.isActive = false;
    await learningPath.save();

    res.json({ message: 'Learning path deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting learning path.', error: error.message });
  }
};

module.exports = {
  createLearningPath,
  getUserLearningPaths,
  getLearningPath,
  updateProgress,
  deleteLearningPath
};

