// Progress model - tracks user learning progress
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Progress = sequelize.define('Progress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  learningPathId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'learning_paths',
      key: 'id'
    }
  },
  quizId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'quizzes',
      key: 'id'
    }
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  timeSpent: {
    type: DataTypes.INTEGER, // in minutes
    defaultValue: 0
  },
  answers: {
    type: DataTypes.JSONB, // Store user's answers
    allowNull: true
  }
}, {
  tableName: 'progress',
  timestamps: true
});

module.exports = Progress;

