// Dashboard page - main user interface
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [learningPaths, setLearningPaths] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newPathForm, setNewPathForm] = useState({
    subject: '',
    topic: '',
    difficulty: 'beginner'
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pathsRes, analyticsRes] = await Promise.all([
        axios.get('/learning-paths'),
        axios.get('/progress/analytics')
      ]);
      
      setLearningPaths(pathsRes.data.learningPaths);
      setAnalytics(analyticsRes.data.analytics);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePath = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/learning-paths', newPathForm);
      setLearningPaths([response.data.learningPath, ...learningPaths]);
      setNewPathForm({ subject: '', topic: '', difficulty: 'beginner' });
      setShowForm(false);
      fetchData(); // Refresh analytics
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create learning path');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = analytics?.learningPathsProgress?.map(path => ({
    name: path.title.substring(0, 15) + (path.title.length > 15 ? '...' : ''),
    progress: path.progress
  })) || [];

  return (
    <div className="dashboard">
      <div className="container">
        <h1>My Learning Dashboard</h1>

        {error && <div className="error">{error}</div>}

        {/* Analytics Section */}
        {analytics && (
          <div className="analytics-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📚</div>
                <div className="stat-value">{learningPaths.length}</div>
                <div className="stat-label">Learning Paths</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-value">{analytics.completedQuizzes}</div>
                <div className="stat-label">Completed Quizzes</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{analytics.averageScore?.toFixed(1)}%</div>
                <div className="stat-label">Average Score</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-value">{analytics.totalTimeSpent}</div>
                <div className="stat-label">Minutes Studied</div>
              </div>
            </div>

            {chartData.length > 0 && (
              <div className="card">
                <h3>Learning Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#4CAF50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Learning Paths Section */}
        <div className="learning-paths-section">
          <div className="section-header">
            <h2>My Learning Paths</h2>
            <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
              {showForm ? 'Cancel' : '+ Create New Path'}
            </button>
          </div>

          {showForm && (
            <div className="card">
              <h3>Create New Learning Path</h3>
              <form onSubmit={handleCreatePath}>
                <input
                  type="text"
                  placeholder="Subject (e.g., Mathematics, Science)"
                  className="input"
                  value={newPathForm.subject}
                  onChange={(e) => setNewPathForm({ ...newPathForm, subject: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Topic (e.g., Algebra, Biology)"
                  className="input"
                  value={newPathForm.topic}
                  onChange={(e) => setNewPathForm({ ...newPathForm, topic: e.target.value })}
                  required
                />
                <select
                  className="input"
                  value={newPathForm.difficulty}
                  onChange={(e) => setNewPathForm({ ...newPathForm, difficulty: e.target.value })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <button type="submit" className="btn btn-primary">
                  Create Learning Path
                </button>
              </form>
            </div>
          )}

          {learningPaths.length === 0 ? (
            <div className="card">
              <p>You don't have any learning paths yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="paths-grid">
              {learningPaths.map((path) => (
                <div key={path.id} className="path-card">
                  <h3>{path.title}</h3>
                  <p className="path-subject">{path.subject}</p>
                  <p className="path-description">{path.description}</p>
                  <div className="path-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                    <span>{path.progress.toFixed(0)}% Complete</span>
                  </div>
                  <div className="path-actions">
                    <Link to={`/learning-path/${path.id}`} className="btn btn-primary">
                      Continue Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

