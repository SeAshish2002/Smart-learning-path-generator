// User model - stores user information
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email address (e.g., user@example.com)'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Can be null if using OAuth
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'instructor', 'parent'),
    defaultValue: 'student'
  },
  learningStyle: {
    type: DataTypes.ENUM('visual', 'auditory', 'kinesthetic', 'reading'),
    defaultValue: 'visual'
  },
  currentLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  oauthProvider: {
    type: DataTypes.STRING, // 'google', 'github', or null
    allowNull: true
  },
  oauthId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;

