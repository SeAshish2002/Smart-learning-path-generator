// Home page component
import React from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="home">
      <div className="hero">
        <div className="container">
          <h1>Welcome to Smart Learning Path Generator</h1>
          <p className="subtitle">
            Your personalized learning companion that adapts to your style and pace
          </p>
          
          {!isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="features">
        <div className="container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Learning</h3>
              <p>AI-generated learning paths tailored to your knowledge level and learning style</p>
            </Link>
            
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Progress Tracking</h3>
              <p>Monitor your learning journey with detailed analytics and progress reports</p>
            </Link>
            
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="feature-card">
              <div className="feature-icon">🧪</div>
              <h3>Adaptive Quizzes</h3>
              <p>Take quizzes that adjust to your skill level and provide instant feedback</p>
            </Link>
            
            <Link to={isAuthenticated ? "/study-groups" : "/register"} className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Study Groups</h3>
              <p>Collaborate with peers and learn together in study groups</p>
            </Link>
            
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>AI Tutoring</h3>
              <p>Get instant explanations and help from our AI tutor</p>
            </Link>
            
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3>Secure & Private</h3>
              <p>Your data is safe with secure authentication and privacy controls</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

