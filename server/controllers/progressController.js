// Progress Controller - tracks and analyzes learning progress
const { Progress, LearningPath, Quiz, User } = require('../models');

// Get all progress records for a user
const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const progressRecords = await Progress.findAll({
      where: { userId },
      include: [
        {
          model: LearningPath,
          as: 'learningPath',
          attributes: ['id', 'title', 'subject']
        },
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({ progress: progressRecords });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress.', error: error.message });
  }
};

// Get progress analytics for dashboard
const getProgressAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all progress records
    const allProgress = await Progress.findAll({
      where: { userId },
      include: [{
        model: LearningPath,
        as: 'learningPath',
        attributes: ['id', 'title', 'subject']
      }]
    });

    // Calculate statistics
    const totalQuizzes = allProgress.filter(p => p.quizId).length;
    const completedQuizzes = allProgress.filter(p => p.completed && p.quizId).length;
    const averageScore = allProgress.length > 0
      ? allProgress.reduce((sum, p) => sum + (p.score || 0), 0) / allProgress.length
      : 0;
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);

    // Get learning paths progress
    const learningPaths = await LearningPath.findAll({
      where: { userId, isActive: true },
      include: [{
        model: Progress,
        as: 'progressRecords',
        required: false
      }]
    });

    const pathsProgress = learningPaths.map(path => ({
      id: path.id,
      title: path.title,
      subject: path.subject,
      progress: path.progress
    }));

    // Progress over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentProgress = allProgress.filter(p => 
      new Date(p.createdAt) >= sevenDaysAgo
    );

    res.json({
      analytics: {
        totalQuizzes,
        completedQuizzes,
        averageScore: Math.round(averageScore * 100) / 100,
        totalTimeSpent, // in minutes
        learningPathsProgress: pathsProgress,
        recentActivity: recentProgress.length
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics.', error: error.message });
  }
};

// Get progress for a specific learning path
const getLearningPathProgress = async (req, res) => {
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

    const progressRecords = await Progress.findAll({
      where: { userId, learningPathId },
      include: [{
        model: Quiz,
        as: 'quiz',
        attributes: ['id', 'title', 'difficulty']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      learningPath: {
        id: learningPath.id,
        title: learningPath.title,
        progress: learningPath.progress
      },
      progress: progressRecords
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress.', error: error.message });
  }
};

module.exports = {
  getUserProgress,
  getProgressAnalytics,
  getLearningPathProgress
};

