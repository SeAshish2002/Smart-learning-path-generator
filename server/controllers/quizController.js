// Quiz Controller - manages quizzes and assessments
const { Quiz, LearningPath, Progress } = require('../models');
const { generateQuizQuestions } = require('../services/aiService');

// Create a new quiz (AI-generated)
const createQuiz = async (req, res) => {
  try {
    const { learningPathId, title, difficulty, numQuestions } = req.body;
    const userId = req.user.id;

    // Verify learning path belongs to user
    const learningPath = await LearningPath.findOne({
      where: { id: learningPathId, userId }
    });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found.' });
    }

    // Generate quiz questions using AI
    const questions = await generateQuizQuestions(
      learningPath.subject,
      numQuestions || 5,
      difficulty || 'medium'
    );

    // Create quiz
    const quiz = await Quiz.create({
      learningPathId,
      title: title || `${learningPath.subject} Quiz`,
      questions,
      difficulty: difficulty || 'medium'
    });

    res.status(201).json({
      message: 'Quiz created successfully!',
      quiz
    });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ message: 'Error creating quiz.', error: error.message });
  }
};

// Get all quizzes for a learning path
const getQuizzes = async (req, res) => {
  try {
    const { learningPathId } = req.params;
    const userId = req.user.id;

    // Verify learning path belongs to user
    const learningPath = await LearningPath.findOne({
      where: { id: learningPathId, userId }
    });

    if (!learningPath) {
      return res.status(404).json({ message: 'Learning path not found.' });
    }

    const quizzes = await Quiz.findAll({
      where: { learningPathId },
      order: [['createdAt', 'DESC']]
    });

    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quizzes.', error: error.message });
  }
};

// Get a specific quiz
const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: LearningPath,
        as: 'learningPath',
        where: { userId }
      }]
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching quiz.', error: error.message });
  }
};

// Submit quiz answers
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeSpent } = req.body;
    const userId = req.user.id;

    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: LearningPath,
        as: 'learningPath',
        where: { userId }
      }]
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Calculate score
    let correctAnswers = 0;
    const questions = quiz.questions;
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / questions.length) * 100;

    // Save progress
    const progress = await Progress.create({
      userId,
      learningPathId: quiz.learningPathId,
      quizId: id,
      score,
      completed: true,
      timeSpent: timeSpent || 0,
      answers
    });

    res.json({
      message: 'Quiz submitted successfully!',
      score,
      correctAnswers,
      totalQuestions: questions.length,
      progress
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Error submitting quiz.', error: error.message });
  }
};

module.exports = {
  createQuiz,
  getQuizzes,
  getQuiz,
  submitQuiz
};

