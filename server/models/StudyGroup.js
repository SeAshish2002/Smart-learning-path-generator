// StudyGroup model - for collaborative learning features
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudyGroup = sequelize.define('StudyGroup', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  learningPathId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'learning_paths',
      key: 'id'
    }
  }
}, {
  tableName: 'study_groups',
  timestamps: true
});

// Many-to-many relationship table
const StudyGroupMember = sequelize.define('StudyGroupMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studyGroupId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'study_groups',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member'
  }
}, {
  tableName: 'study_group_members',
  timestamps: true
});

module.exports = { StudyGroup, StudyGroupMember };

