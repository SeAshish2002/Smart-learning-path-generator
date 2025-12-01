// AI Controller - handles AI-powered features
const {
  getTutoringExplanation,
  generateLearningContent,
  generateQuizQuestions,
  generateModuleContent,
  generateIntroductionContent,
  generateSectionContent,
  extractTopicAndSectionType
} = require('../services/aiService');

// Get tutoring explanation for a question
const getExplanation = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required.' });
    }

    const explanation = await getTutoringExplanation(question, context);

    res.json({
      message: 'Explanation generated successfully!',
      explanation: explanation.explanation
    });
  } catch (error) {
    console.error('Error generating explanation:', error);
    res.status(500).json({ message: 'Error generating explanation.', error: error.message });
  }
};

// Generate learning content
const generateContent = async (req, res) => {
  try {
    const { topic, level, learningStyle } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    const content = await generateLearningContent(
      topic,
      level || 'beginner',
      learningStyle || 'visual'
    );

    res.json({
      message: 'Content generated successfully!',
      content
    });
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ message: 'Error generating content.', error: error.message });
  }
};

// Generate quiz questions
const generateQuestions = async (req, res) => {
  try {
    const { topic, numQuestions, difficulty } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required.' });
    }

    const questions = await generateQuizQuestions(
      topic,
      numQuestions || 5,
      difficulty || 'medium'
    );

    res.json({
      message: 'Questions generated successfully!',
      questions
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({ message: 'Error generating questions.', error: error.message });
  }
};

// Generate detailed module content
const generateModuleDetails = async (req, res) => {
  try {
    const { moduleTitle, topic, level, learningStyle } = req.body;

    if (!moduleTitle || !topic) {
      return res.status(400).json({ message: 'Module title and topic are required.' });
    }

    const content = await generateModuleContent(
      moduleTitle,
      topic,
      level || 'beginner',
      learningStyle || 'visual'
    );

    res.json({
      message: 'Module content generated successfully!',
      content
    });
  } catch (error) {
    console.error('Error generating module content:', error);
    res.status(500).json({ message: 'Error generating module content.', error: error.message });
  }
};

// Generate introduction content only
const generateIntroduction = async (req, res) => {
  try {
    const { topic, subtopic, level } = req.body;

    if (!topic || !subtopic) {
      return res.status(400).json({ message: 'Topic and subtopic are required.' });
    }

    const introduction = await generateIntroductionContent(
      topic,
      subtopic,
      level || 'beginner'
    );

    res.json({
      message: 'Introduction generated successfully!',
      introduction
    });
  } catch (error) {
    console.error('Error generating introduction:', error);
    res.status(500).json({ message: 'Error generating introduction.', error: error.message });
  }
};

// Generate section content only
const generateSection = async (req, res) => {
  try {
    const { subject, topic, topicName, level, sectionHeading, sectionType } = req.body;

    console.log('Generate section request received:', {
      subject,
      topic,
      topicName,
      level,
      sectionHeading,
      sectionType
    });

    // Start with topicName if provided, otherwise topic
    let actualTopic = (topicName || topic || '').trim();
    let effectiveSectionType = sectionType || 'explanation';

    // If frontend sends a heading like "Practical Examples of mathematics"
    // and no explicit sectionType, derive both from the heading
    if (sectionHeading && (!sectionType || !actualTopic)) {
      const extracted = extractTopicAndSectionType(sectionHeading, subject);
      console.log('Extracted from heading:', extracted);

      if (!actualTopic && extracted.topicName) {
        actualTopic = extracted.topicName;
      }
      if (!sectionType && extracted.sectionType) {
        // Map extracted section type to expected values
        // 'applications' from extraction should work with 'applications' check
        // But we can also normalize 'applications' to 'practical_examples' if needed
        effectiveSectionType = extracted.sectionType === 'applications' ? 'applications' : extracted.sectionType;
      }
    }

    if (!subject || !actualTopic) {
      console.error('Missing required fields:', { subject, topic: actualTopic });
      return res.status(400).json({ message: 'Subject and topic are required.' });
    }

    console.log('Calling generateSectionContent with:', {
      subject,
      topic: actualTopic,
      level: level || 'beginner',
      sectionType: effectiveSectionType
    });

    const content = await generateSectionContent(
      subject,
      actualTopic,
      level || 'beginner',
      effectiveSectionType
    );

    console.log('Section content generated successfully, length:', content?.length || 0);

    if (!content) {
      console.error('No content returned from generateSectionContent');
      return res.status(500).json({ message: 'Failed to generate section content.' });
    }

    res.json({
      message: 'Section content generated successfully!',
      content
    });
  } catch (error) {
    console.error('Error generating section content:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Error generating section content.',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getExplanation,
  generateContent,
  generateQuestions,
  generateModuleDetails,
  generateIntroduction,
  generateSection
};
