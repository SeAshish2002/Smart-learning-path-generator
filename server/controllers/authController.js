// Authentication Controller - handles login and register
const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

// Register new user
const register = async (req, res) => {
  try {
    const { email, password, name, learningStyle, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      learningStyle: learningStyle || 'visual',
      role: role || 'student'
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        learningStyle: user.learningStyle
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(err => err.message).join(', ');
      return res.status(400).json({ 
        message: 'Validation failed: ' + validationErrors,
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    
    // Handle unique constraint errors (duplicate email)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'A user with this email already exists. Please use a different email or login instead.' 
      });
    }
    
    res.status(500).json({ message: 'Error registering user.', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check password (skip if OAuth user)
    if (user.password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }
    } else {
      return res.status(401).json({ message: 'Please use OAuth to login.' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        learningStyle: user.learningStyle,
        currentLevel: user.currentLevel
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in.', error: error.message });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile.', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile
};

