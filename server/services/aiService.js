// AI Service - handles content generation using OpenAI
const OpenAI = require('openai');

// Initialize OpenAI client (you'll need to set OPENAI_API_KEY in .env)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

/**
 * Generate personalized learning content
 * @param {string} topic - The topic to generate content for
 * @param {string} level - User's current level (beginner/intermediate/advanced)
 * @param {string} learningStyle - User's preferred learning style
 */
const generateLearningContent = async (topic, level = 'beginner', learningStyle = 'visual') => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback content if API key is not set
      return {
        title: `Introduction to ${topic}`,
        content: `This is a sample learning module about ${topic} for ${level} level students.`,
        modules: [
          {
            title: `Module 1: Basics of ${topic}`,
            content: `Learn the fundamentals of ${topic}.`,
            duration: 30
          }
        ]
      };
    }

    const prompt = `Create a personalized learning path for a ${level} level student learning about ${topic}. 
    The student prefers ${learningStyle} learning style. 
    Generate a structured learning path with:
    1. A clear title
    2. An overview/description
    3. 3-5 modules with titles and brief descriptions
    4. Estimated time for each module
    
    Format the response as JSON with: {title, description, modules: [{title, content, duration}]}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert educational content creator.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('AI Content Generation Error:', error);
    // Return fallback content
    return {
      title: `Introduction to ${topic}`,
      description: `A personalized learning path for ${topic}`,
      modules: [
        {
          title: `Getting Started with ${topic}`,
          content: `Learn the basics of ${topic} at ${level} level.`,
          duration: 30
        }
      ]
    };
  }
};

/**
 * Generate quiz questions for a topic
 * @param {string} topic - The topic for quiz questions
 * @param {number} numQuestions - Number of questions to generate
 * @param {string} difficulty - Difficulty level
 */
const generateQuizQuestions = async (topic, numQuestions = 5, difficulty = 'medium') => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      // Fallback questions
      return [
        {
          question: `What is the main concept of ${topic}?`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: `This is a sample question about ${topic}.`
        }
      ];
    }

    const prompt = `Generate ${numQuestions} ${difficulty} level quiz questions about ${topic}.
    Each question should have:
    - A clear question text
    - 4 multiple choice options
    - The correct answer index (0-3)
    - A brief explanation
    
    Format as JSON array: [{question, options: [4 options], correctAnswer: 0-3, explanation}]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert quiz creator.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const response = completion.choices[0].message.content;
    return JSON.parse(response);
  } catch (error) {
    console.error('AI Quiz Generation Error:', error);
    return [
      {
        question: `Sample question about ${topic}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: `Sample explanation for ${topic}.`
      }
    ];
  }
};

/**
 * Get personalized tutoring explanation
 * @param {string} question - Student's question
 * @param {string} context - Learning context
 */
const getTutoringExplanation = async (question, context = '') => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        explanation: `Here's a helpful explanation: ${question}. This is a sample tutoring response.`
      };
    }

    const prompt = `As an intelligent tutor, provide a clear, step-by-step explanation for this question: "${question}"
    ${context ? `Context: ${context}` : ''}
    Make it easy to understand and helpful for learning.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a patient and helpful tutor.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    return {
      explanation: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('AI Tutoring Error:', error);
    return {
      explanation: `I'm here to help! This is a sample explanation for your question.`
    };
  }
};

module.exports = {
  generateLearningContent,
  generateQuizQuestions,
  getTutoringExplanation
};

