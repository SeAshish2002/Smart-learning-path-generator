// Quiz model - stores quiz questions and answers
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  learningPathId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'learning_paths',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  questions: {
    type: DataTypes.JSONB, // Array of question objects
    allowNull: false
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium'
  },
  timeLimit: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: true
  }
}, {
  tableName: 'quizzes',
  timestamps: true
});

module.exports = Quiz;

