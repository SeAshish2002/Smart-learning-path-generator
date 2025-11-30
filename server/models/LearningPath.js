// LearningPath model - stores personalized learning paths for users
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LearningPath = sequelize.define('LearningPath', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false // e.g., 'Mathematics', 'Science', 'Programming'
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  content: {
    type: DataTypes.JSONB, // Stores structured content (lessons, modules, etc.)
    allowNull: true
  },
  progress: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'learning_paths',
  timestamps: true
});

module.exports = LearningPath;

