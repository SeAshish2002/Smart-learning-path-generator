// Quiz page - displays and handles quiz taking
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Quiz.css';

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchQuiz();
    
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // in minutes
    }, 60000);

    return () => clearInterval(interval);
  }, [id, startTime]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`/quizzes/${id}`);
      setQuiz(response.data.quiz);
      setAnswers(new Array(response.data.quiz.questions.length).fill(null));
    } catch (error) {
      console.error('Error fetching quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      setSubmitting(true);
      
      try {
        const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000 / 60);
        const response = await axios.post(`/quizzes/${id}/submit`, {
          answers,
          timeSpent: finalTimeSpent
        });
        
        setResult(response.data);
      } catch (error) {
        console.error('Error submitting quiz:', error);
        alert('Failed to submit quiz. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container">
        <div className="error">Quiz not found</div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="quiz-result">
        <div className="container">
          <div className="card result-card">
            <h2>Quiz Results</h2>
            <div className="result-score">
              <div className="score-circle">
                <span className="score-value">{result.score.toFixed(0)}%</span>
              </div>
              <p>
                You got {result.correctAnswers} out of {result.totalQuestions} questions correct!
              </p>
            </div>
            <div className="result-actions">
              <button 
                onClick={() => navigate(`/learning-path/${quiz.learningPathId}`)}
                className="btn btn-primary"
              >
                Back to Learning Path
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <div className="quiz-page">
      <div className="container">
        <h1>{quiz.title}</h1>
        
        <div className="quiz-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
        </div>

        <div className="quiz-content">
          <div className="question-card">
            <h2>{question.question}</h2>
            
            <div className="options-list">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${answers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            
            {currentQuestion === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || answers.some(a => a === null)}
                className="btn btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn btn-primary"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;

