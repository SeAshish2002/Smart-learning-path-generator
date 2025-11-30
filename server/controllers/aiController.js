// AI Controller - handles AI-powered features
const { getTutoringExplanation, generateLearningContent, generateQuizQuestions } = require('../services/aiService');

// Get tutoring explanation for a question
const getExplanation = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required.' });
    }

    const explanation = await getTutoringExplanation(question, context);

    res.json({
      message: 'Explanation generated successfully!',
      explanation: explanation.explanation
    });
  } catch (error) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ message: 'Error generating explanation.', error: error.message });
  }
};

// Generate learning content
const generateContent = async (req, res) => {
  try {
    const { topic, level, learningStyle } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    const content = await generateLearningContent(
      topic,
      level || 'beginner',
      learningStyle || 'visual'
    );

    res.json({
      message: 'Content generated successfully!',
      content
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ message: 'Error generating content.', error: error.message });
  }
};

// Generate quiz questions
const generateQuestions = async (req, res) => {
  try {
    const { topic, numQuestions, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    const questions = await generateQuizQuestions(
      topic,
      numQuestions || 5,
      difficulty || 'medium'
    );

    res.json({
      message: 'Questions generated successfully!',
      questions
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Error generating questions.', error: error.message });
  }
};

module.exports = {
  getExplanation,
  generateContent,
  generateQuestions
};

