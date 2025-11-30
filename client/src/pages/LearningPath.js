// Learning Path page - displays learning content
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './LearningPath.css';

const LearningPath = () => {
  const { id } = useParams();
  const [learningPath, setLearningPath] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    difficulty: 'medium',
    numQuestions: 5
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [pathRes, quizzesRes] = await Promise.all([
        axios.get(`/learning-paths/${id}`),
        axios.get(`/quizzes/learning-path/${id}`)
      ]);
      
      setLearningPath(pathRes.data.learningPath);
      setQuizzes(quizzesRes.data.quizzes || []);
    } catch (error) {
      setError('Failed to load learning path');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/quizzes', {
        learningPathId: id,
        ...newQuiz
      });
      setQuizzes([...quizzes, response.data.quiz]);
      setNewQuiz({ title: '', difficulty: 'medium', numQuestions: 5 });
      setShowQuizForm(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  const handleUpdateProgress = async (progress) => {
    try {
      await axios.put(`/learning-paths/${id}/progress`, { progress });
      setLearningPath({ ...learningPath, progress });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!learningPath) {
    return (
      <div className="container">
        <div className="error">Learning path not found</div>
      </div>
    );
  }

  const modules = learningPath.content?.modules || [];

  return (
    <div className="learning-path-page">
      <div className="container">
        <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
        
        <div className="path-header">
          <h1>{learningPath.title}</h1>
          <p className="path-subject">{learningPath.subject}</p>
          <div className="path-progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${learningPath.progress}%` }}
              ></div>
            </div>
            <span>{learningPath.progress.toFixed(0)}% Complete</span>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Learning Modules */}
        <div className="modules-section">
          <h2>Learning Modules</h2>
          {modules.length === 0 ? (
            <div className="card">
              <p>No modules available yet. Content is being generated...</p>
            </div>
          ) : (
            <div className="modules-list">
              {modules.map((module, index) => (
                <div key={index} className="module-card">
                  <div className="module-number">Module {index + 1}</div>
                  <h3>{module.title}</h3>
                  <p>{module.content}</p>
                  <div className="module-meta">
                    <span>⏱️ {module.duration || 30} minutes</span>
                  </div>
                  <button
                    onClick={() => handleUpdateProgress(Math.min(100, (index + 1) / modules.length * 100))}
                    className="btn btn-primary"
                  >
                    Mark as Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quizzes Section */}
        <div className="quizzes-section">
          <div className="section-header">
            <h2>Quizzes</h2>
            <button 
              onClick={() => setShowQuizForm(!showQuizForm)} 
              className="btn btn-primary"
            >
              {showQuizForm ? 'Cancel' : '+ Create Quiz'}
            </button>
          </div>

          {showQuizForm && (
            <div className="card">
              <h3>Create New Quiz</h3>
              <form onSubmit={handleCreateQuiz}>
                <input
                  type="text"
                  placeholder="Quiz Title"
                  className="input"
                  value={newQuiz.title}
                  onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                />
                <select
                  className="input"
                  value={newQuiz.difficulty}
                  onChange={(e) => setNewQuiz({ ...newQuiz, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input
                  type="number"
                  placeholder="Number of Questions"
                  className="input"
                  value={newQuiz.numQuestions}
                  onChange={(e) => setNewQuiz({ ...newQuiz, numQuestions: parseInt(e.target.value) })}
                  min="1"
                  max="20"
                />
                <button type="submit" className="btn btn-primary">
                  Generate Quiz
                </button>
              </form>
            </div>
          )}

          {quizzes.length === 0 ? (
            <div className="card">
              <p>No quizzes yet. Create one to test your knowledge!</p>
            </div>
          ) : (
            <div className="quizzes-list">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-card">
                  <h3>{quiz.title}</h3>
                  <p>Difficulty: {quiz.difficulty}</p>
                  <p>Questions: {quiz.questions?.length || 0}</p>
                  <Link to={`/quiz/${quiz.id}`} className="btn btn-primary">
                    Take Quiz
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;

