// Main server file - Entry point for the backend
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('./config/passport');
const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const learningPathRoutes = require('./routes/learningPaths');
const quizRoutes = require('./routes/quizzes');
const progressRoutes = require('./routes/progress');
const aiRoutes = require('./routes/ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Learning Path Generator API is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync database models (creates tables if they don't exist)
    // In production, use migrations instead
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ force: false });
      console.log('✅ Database models synchronized.');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;

