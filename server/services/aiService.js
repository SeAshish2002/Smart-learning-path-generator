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
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log('⚠️  OpenAI API key not set, using fallback content');
      // Fallback content if API key is not set
      return {
        title: `Introduction to ${topic}`,
        description: `A personalized learning path for ${topic} at ${level} level`,
        modules: [
          {
            title: `Module 1: Basics of ${topic}`,
            content: `Learn the fundamentals of ${topic}. This module covers the essential concepts you need to get started.`,
            duration: 30
          },
          {
            title: `Module 2: Intermediate ${topic}`,
            content: `Build upon the basics and explore more advanced concepts in ${topic}.`,
            duration: 45
          },
          {
            title: `Module 3: Practical Applications`,
            content: `Apply what you've learned through hands-on exercises and real-world examples.`,
            duration: 60
          }
        ]
      };
    }

    const prompt = `Create a comprehensive personalized learning path for a ${level} level student learning about ${topic}. 
    The student prefers ${learningStyle} learning style. 
    
    Generate a structured learning path with:
    1. A clear, engaging title
    2. A detailed overview/description (2-3 sentences explaining what they'll learn)
    3. 4-5 modules, each with:
       - A descriptive title
       - Detailed content (at least 3-4 sentences explaining what will be covered, key concepts, and learning objectives)
       - Estimated duration in minutes
    
    Make the content detailed and educational. Each module's content should explain what the student will learn, key topics covered, and practical applications.
    
    IMPORTANT: Respond with ONLY valid JSON, no markdown, no code blocks. 
    Format: {"title": "...", "description": "...", "modules": [{"title": "...", "content": "detailed explanation here (3-4 sentences minimum)", "duration": 30}]}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert educational content creator. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    let response = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (response.startsWith('```json')) {
      response = response.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (response.startsWith('```')) {
      response = response.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const parsed = JSON.parse(response);
      
      // Validate and ensure modules have content
      if (parsed.modules && Array.isArray(parsed.modules)) {
        // Process modules and generate content for those missing it
        for (let index = 0; index < parsed.modules.length; index++) {
          const module = parsed.modules[index];
          
          // If content is missing or too short, generate it using AI
          if (!module.content || module.content.trim().length < 20) {
            console.warn(`Module ${index + 1} "${module.title}" has empty or short content, generating AI content`);
            try {
              // Generate module content using AI
              const generatedContent = await generateModuleDescription(topic, module.title || `Module ${index + 1}`, level);
              module.content = generatedContent;
            } catch (error) {
              console.error(`Error generating content for module ${index + 1}:`, error);
              // Fallback if AI generation fails
              module.content = `This module covers ${module.title || 'key concepts'} in ${topic}. You'll learn essential principles, practical examples, and real-world applications related to ${topic}.`;
            }
          }
          
          // Ensure content is a string
          if (typeof module.content !== 'string') {
            module.content = String(module.content);
          }
          
          // Ensure title exists
          if (!module.title || module.title.trim().length === 0) {
            module.title = `Module ${index + 1}: Learning ${topic}`;
          }
          
          // Ensure duration exists
          if (!module.duration || typeof module.duration !== 'number') {
            module.duration = 30 + (index * 15);
          }
        }
      } else if (!parsed.modules) {
        // If modules don't exist, create default ones
        console.warn('No modules in AI response, creating default modules');
        parsed.modules = [
          {
            title: `Introduction to ${topic}`,
            content: `This foundational module introduces you to ${topic}. You'll learn the core concepts, basic terminology, and fundamental principles. Through clear explanations and examples, you'll build a solid understanding that serves as the foundation for more advanced topics.`,
            duration: 30
          },
          {
            title: `Core Concepts of ${topic}`,
            content: `Building on the introduction, this module delves deeper into the core concepts of ${topic}. You'll explore how different elements work together, understand relationships between concepts, and see practical applications. This module strengthens your foundational knowledge.`,
            duration: 45
          },
          {
            title: `Practical Applications`,
            content: `This module focuses on applying your knowledge of ${topic} in real-world scenarios. You'll work through practical examples, solve problems, and learn best practices. This hands-on approach helps you understand how theory translates into practice.`,
            duration: 60
          }
        ];
      }
      
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response was:', response);
      // Return fallback if parsing fails
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI Content Generation Error:', error.message);
    // Return fallback content
    return {
      title: `Introduction to ${topic}`,
      description: `A personalized learning path for ${topic} at ${level} level`,
      modules: [
        {
          title: `Getting Started with ${topic}`,
          content: `In this foundational module, you'll learn the core concepts of ${topic} at a ${level} level. We'll start with the basics, covering essential terminology and fundamental principles. You'll understand the key building blocks and how they work together. By the end, you'll have a solid foundation to build upon.`,
          duration: 30
        },
        {
          title: `Intermediate Concepts`,
          content: `Building on your foundation, this module explores more advanced topics in ${topic}. You'll dive deeper into complex concepts, learn about different approaches and methodologies, and understand how to apply these concepts in various scenarios. This will significantly expand your understanding and practical skills.`,
          duration: 45
        },
        {
          title: `Practical Applications`,
          content: `This module focuses on real-world applications of ${topic}. You'll work through practical examples, solve problems, and see how these concepts are used in actual scenarios. You'll gain hands-on experience and learn best practices that you can apply immediately in your own projects or studies.`,
          duration: 60
        },
        {
          title: `Advanced Topics and Mastery`,
          content: `In this advanced module, you'll explore sophisticated concepts and techniques in ${topic}. You'll learn about optimization, best practices, and advanced strategies. This module will help you achieve mastery and prepare you to tackle complex challenges confidently.`,
          duration: 75
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
    Each question must have:
    - A clear, specific question text
    - Exactly 4 multiple choice options (make them realistic and different from each other)
    - The correct answer index (0-3, where 0 is the first option)
    - A brief explanation of why the answer is correct
    
    IMPORTANT: 
    - Make sure each option is a complete, meaningful answer
    - Options should be plausible but only one should be correct
    - Respond with ONLY valid JSON array, no markdown, no code blocks
    - Format: [{"question": "...", "options": ["option1", "option2", "option3", "option4"], "correctAnswer": 0, "explanation": "..."}]`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert quiz creator. Always respond with valid JSON only, no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2500
    });

    let response = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (response.startsWith('```json')) {
      response = response.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (response.startsWith('```')) {
      response = response.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const parsed = JSON.parse(response);
      const questions = Array.isArray(parsed) ? parsed : [parsed];
      
      // Validate and fix questions
      const validatedQuestions = questions.map((q, index) => {
        // Ensure options array exists and has 4 items
        if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          console.warn(`Question ${index + 1} has invalid options, fixing...`);
          q.options = [
            `The first option about ${topic}`,
            `The second option about ${topic}`,
            `The third option about ${topic}`,
            `The fourth option about ${topic}`
          ];
        }
        
        // Ensure all options are strings and not empty
        q.options = q.options.map((opt, optIndex) => {
          if (!opt || typeof opt !== 'string' || opt.trim().length === 0) {
            return `Option ${optIndex + 1} about ${topic}`;
          }
          return opt.trim();
        });
        
        // Ensure correctAnswer is valid
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          q.correctAnswer = 0;
        }
        
        // Ensure question text exists
        if (!q.question || q.question.trim().length === 0) {
          q.question = `Question ${index + 1} about ${topic}?`;
        }
        
        // Ensure explanation exists
        if (!q.explanation || q.explanation.trim().length === 0) {
          q.explanation = `This is the correct answer because it best explains the concept of ${topic}.`;
        }
        
        return q;
      });
      
      return validatedQuestions;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response was:', response);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI Quiz Generation Error:', error.message);
    // Return better fallback questions
    return Array.from({ length: numQuestions }, (_, i) => ({
      question: `What is a key concept about ${topic}?`,
      options: [
        `A fundamental principle of ${topic}`,
        `An advanced technique in ${topic}`,
        `A common misconception about ${topic}`,
        `A related topic to ${topic}`
      ],
      correctAnswer: 0,
      explanation: `This question tests your understanding of ${topic}. The correct answer explains a fundamental principle.`
    }));
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
      model: 'gpt-3.5-turbo',
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

/**
 * Extract topic name and section type from section heading
 * Example: "Introduction to Photosynthesis" -> { topicName: "Photosynthesis", sectionType: "introduction" }
 * Example: "Key Concepts of Science" -> { topicName: "Science", sectionType: "key concepts" }
 */
const extractTopicAndSectionType = (sectionHeading, subject) => {
  const headingLower = sectionHeading.toLowerCase();
  
  // Common section type patterns
  const sectionTypes = {
    'introduction': ['introduction', 'intro', 'overview', 'getting started', 'basics'],
    'key concepts': ['key concepts', 'concepts', 'principles', 'fundamentals'],
    'how it works': ['how', 'works', 'mechanism', 'process'],
    'applications': ['applications', 'examples', 'uses', 'practice'],
    'summary': ['summary', 'conclusion', 'recap'],
    'next steps': ['next steps', 'continue', 'further', 'advanced']
  };
  
  let sectionType = 'general';
  for (const [type, keywords] of Object.entries(sectionTypes)) {
    if (keywords.some(keyword => headingLower.includes(keyword))) {
      sectionType = type;
      break;
    }
  }
  
  // Extract topic name - remove common prefixes
  let topicName = sectionHeading;
  const prefixes = ['introduction to', 'basics of', 'overview of', 'key concepts of', 'fundamentals of'];
  for (const prefix of prefixes) {
    if (headingLower.startsWith(prefix)) {
      topicName = sectionHeading.substring(prefix.length).trim();
      break;
    }
  }
  
  // If topicName is still the full heading, try to extract from "X of Y" pattern
  if (topicName === sectionHeading && headingLower.includes(' of ')) {
    const parts = sectionHeading.split(' of ');
    if (parts.length > 1) {
      topicName = parts[parts.length - 1].trim();
    }
  }
  
  // If we have a subject and topicName matches it, use subject as topic
  if (subject && topicName.toLowerCase() === subject.toLowerCase()) {
    topicName = subject;
  }
  
  return { topicName, sectionType };
};

/**
 * Extract actual topic name from section heading
 * Example: "Getting Started with algebra" -> "algebra"
 * Example: "Key Concepts of mathematics" -> "mathematics" (if subject matches) or extract from heading
 */
const extractTopicFromHeading = (sectionHeading, subject) => {
  const headingLower = sectionHeading.toLowerCase();
  const subjectLower = subject.toLowerCase();
  
  // Remove common prefixes to get the actual topic
  const prefixes = [
    'getting started with',
    'introduction to',
    'basics of',
    'overview of',
    'key concepts of',
    'fundamentals of',
    'introduction to the',
    'basics of the'
  ];
  
  let topic = sectionHeading;
  
  // Try to remove prefixes
  for (const prefix of prefixes) {
    if (headingLower.startsWith(prefix)) {
      topic = sectionHeading.substring(prefix.length).trim();
      break;
    }
  }
  
  // If topic is still the full heading, try "X of Y" pattern
  if (topic === sectionHeading && headingLower.includes(' of ')) {
    const parts = sectionHeading.split(' of ');
    if (parts.length > 1) {
      topic = parts[parts.length - 1].trim();
    }
  }
  
  // If topic matches subject exactly, we need to extract from module title or use subject
  // For now, return the extracted topic (will be overridden by topicName parameter if provided)
  return topic;
};

/**
 * Generate detailed section content using AI
 * @param {string} subject - The subject (e.g., "Mathematics", "Science")
 * @param {string} topic - The actual topic name (e.g., "Algebra", "Photosynthesis") - NOT the section heading
 * @param {string} level - User's current level (optional)
 * @param {string} sectionType - Type of section (e.g., 'explanation', 'practical_examples', 'applications')
 */
const generateSectionContent = async (subject, topic, level = 'beginner', sectionType = 'explanation') => {
  try {
    // Ensure we have valid subject and topic
    if (!subject || !topic) {
      throw new Error('Subject and topic are required');
    }
    
    // Use the actual topic name, not the section heading
    const actualTopic = topic.trim();
    const actualSubject = subject.trim();
    
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log('⚠️  OpenAI API key not set, using fallback section content');

      if (sectionType === 'practical_examples' || sectionType === 'applications') {
        return `Here are some practical examples of ${actualTopic} in ${actualSubject}:

1. Solving real-life word problems, such as calculating total cost, discounts, or profit.
2. Planning budgets and splitting amounts equally using equations and expressions.
3. Understanding graphs and trends, for example in sales, temperature, or population data.
4. Designing and analyzing simple formulas in spreadsheets to automate calculations.
5. Using unknown values (variables) to model situations like distance, speed, or time.`;
      }

      return `${actualTopic} is an important concept in ${actualSubject}. Understanding ${actualTopic} helps you grasp fundamental principles and their real-world applications.`;
    }

    // Choose prompt based on sectionType
    let prompt;

    if (sectionType === 'practical_examples' || sectionType === 'applications') {
      // PRACTICAL EXAMPLES MODE
      prompt = `You are a helpful ${actualSubject.toLowerCase()} tutor.

Write 4–6 practical, real-world examples of how the TOPIC is used in the SUBJECT.

Rules:
- Start directly with the examples as a numbered list.
- Each example should be 1–2 sentences.
- Focus on daily life, business, science, or technology.
- Do NOT say things like "This section covers..." or "Understanding X helps you grasp...".
- Do NOT just define the topic. Show where and how it is used.

SUBJECT: ${actualSubject}
TOPIC: ${actualTopic}`;
    } else {
      // NORMAL EXPLANATION MODE (default)
      prompt = `You are a helpful tutor.

Write a clear, beginner-friendly explanation of the given TOPIC in the given SUBJECT.

Rules:
- Directly explain the concept.
- Do NOT say 'this section covers', 'you will learn', 'in this section', etc.
- Do NOT repeat phrases like 'Getting Started with algebra' or 'Key Concepts of mathematics'.
- Just explain the topic itself in simple language.
- Length: about 120–180 words.

SUBJECT: ${actualSubject}
TOPIC: ${actualTopic}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful educational tutor. Write clear, direct explanations or examples of concepts. Do not use meta-phrases about learning or sections.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: sectionType === 'practical_examples' || sectionType === 'applications' ? 220 : 300
    });

    let sectionContent = completion.choices[0].message.content.trim();
    
    // Remove any markdown heading formatting
    if (sectionContent.startsWith('#')) {
      sectionContent = sectionContent.replace(/^#+\s*/, '');
    }
    
    // Validate content is not too generic
    const contentLower = sectionContent.toLowerCase();
    const forbiddenPhrases = [
      'this section covers',
      'you\'ll learn about',
      'we\'ll explore',
      'in this section',
      'this module',
      'you will learn',
      'getting started with',
      'key concepts of'
    ];
    
    const hasGenericPatterns = forbiddenPhrases.some(phrase => contentLower.includes(phrase));
    
    if (sectionContent.length < 80 || hasGenericPatterns) {
      console.warn('Section content is too generic or too short, using fallback');

      if (sectionType === 'practical_examples' || sectionType === 'applications') {
        sectionContent = `Here are some practical examples of ${actualTopic} in ${actualSubject}:

1. Solving real-life word problems, such as calculating total cost, discounts, or profit.
2. Planning budgets and splitting amounts equally using equations and expressions.
3. Understanding graphs and trends, for example in sales, temperature, or population data.
4. Designing and analyzing simple formulas in spreadsheets to automate calculations.
5. Using unknown values (variables) to model situations like distance, speed, or time.`;
      } else {
        sectionContent = `${actualTopic} is an important concept in ${actualSubject}. Understanding ${actualTopic} helps you grasp fundamental principles and their real-world applications.`;
      }
    }
    
    return sectionContent;
  } catch (error) {
    console.error('AI Section Content Generation Error:', error.message);

    if (sectionType === 'practical_examples' || sectionType === 'applications') {
      return `Here are some practical examples of ${topic} in ${subject}:

1. Solving real-life word problems (money, distance, time).
2. Using formulas to calculate marks, averages, and percentages.
3. Planning budgets and tracking expenses using equations.
4. Understanding graphs and charts in news, reports, and apps.`;
    }

    return `${topic} is an important concept in ${subject}. Understanding ${topic} helps you grasp fundamental principles and their applications.`;
  }
};

/**
 * Generate detailed introduction content using AI
 * @param {string} topic - The main topic (e.g., "Computer", "Biology")
 * @param {string} subtopic - The subtopic/module title (e.g., "Introduction to Computer")
 * @param {string} level - User's current level
 */
const generateIntroductionContent = async (topic, subtopic, level = 'beginner') => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log('⚠️  OpenAI API key not set, using fallback introduction');
      return `Welcome to ${subtopic}. This module provides a comprehensive introduction to ${topic}, covering essential concepts and foundational knowledge. You'll build a solid understanding of ${topic} that prepares you for more advanced learning.`;
    }

    const prompt = `Write a detailed, informative introduction (3-4 paragraphs) about "${subtopic}" which is part of learning ${topic}.

The student is at ${level} level.

IMPORTANT:
- Write actual content about ${topic} and ${subtopic}, not generic statements
- Include specific information, facts, and explanations about ${topic}
- Explain what ${subtopic} covers and why it's important
- Make it educational and informative
- Do NOT just repeat the topic name - write actual content about it
- Each paragraph should be 3-4 sentences with real information

Write ONLY the introduction text, no JSON, no markdown, just the content paragraphs.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are an expert teacher specializing in ${topic}. Write detailed, informative educational content about ${topic}. Include actual facts, concepts, and information, not generic statements.` },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 800
    });

    let introduction = completion.choices[0].message.content.trim();
    
    // Remove any markdown formatting
    if (introduction.startsWith('#')) {
      introduction = introduction.replace(/^#+\s*/, '');
    }
    
    // Validate content is not too generic
    if (introduction.length < 200 || introduction.split(' ').filter(w => w.toLowerCase() === topic.toLowerCase()).length > 8) {
      console.warn('Introduction is too generic, using enhanced fallback');
      introduction = `Welcome to ${subtopic}, an essential module in your journey to understand ${topic}. ${topic} is a fascinating field that encompasses many important concepts, principles, and applications. This module will introduce you to the fundamental aspects of ${topic}, providing you with a solid foundation that supports all future learning. You'll explore key concepts, understand basic principles, and see how different elements of ${topic} work together. Whether you're completely new to ${topic} or have some basic knowledge, this module will build your understanding systematically, ensuring you grasp each concept before moving to more advanced topics.`;
    }
    
    return introduction;
  } catch (error) {
    console.error('AI Introduction Generation Error:', error.message);
    return `Welcome to ${subtopic}. This module provides a comprehensive introduction to ${topic}, covering essential concepts and foundational knowledge. You'll build a solid understanding of ${topic} that prepares you for more advanced learning.`;
  }
};

/**
 * Generate detailed introduction content (fallback helper)
 */
const generateDetailedIntroduction = (topic, moduleTitle, level) => {
  return `${moduleTitle} introduces you to the fascinating world of ${topic}. ${topic} is a field that encompasses many important concepts, principles, and applications that are essential to understand. In this module, you'll explore the fundamental aspects of ${topic}, learning about its core components, how they work together, and why they matter. Whether you're completely new to ${topic} or have some basic knowledge, this module will build a solid foundation. We'll start with the basics and gradually introduce more complex ideas, ensuring you understand each concept before moving forward. By the end of this module, you'll have a comprehensive understanding of ${topic} and be ready to explore more advanced topics.`;
};

/**
 * Generate module description/content using AI
 * @param {string} topic - The main topic (e.g., "Computer", "Science")
 * @param {string} moduleTitle - The module title (e.g., "Introduction to Computer")
 * @param {string} level - User's current level
 */
const generateModuleDescription = async (topic, moduleTitle, level = 'beginner') => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log('⚠️  OpenAI API key not set, using fallback module description');
      return `This module covers ${moduleTitle} in ${topic}. You'll learn essential principles, practical examples, and real-world applications related to ${topic}.`;
    }

    const prompt = `Write a brief but informative description (2-3 sentences) for a module titled "${moduleTitle}" which is part of learning ${topic}.

The student is at ${level} level.

IMPORTANT:
- Write actual content about ${topic} and ${moduleTitle}, not generic statements
- Include what the student will learn in this module
- Make it educational and informative
- Do NOT just repeat the topic name - write actual content about it
- Keep it concise (2-3 sentences)

Write ONLY the description text, no JSON, no markdown, just the content.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are an expert teacher specializing in ${topic}. Write brief, informative module descriptions about ${topic}. Include actual information, not generic statements.` },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 200
    });

    let description = completion.choices[0].message.content.trim();
    
    // Remove any markdown formatting
    if (description.startsWith('#')) {
      description = description.replace(/^#+\s*/, '');
    }
    
    // Validate content is not too generic
    if (description.length < 50 || description.split(' ').filter(w => w.toLowerCase() === topic.toLowerCase()).length > 5) {
      console.warn('Module description is too generic, using enhanced fallback');
      description = `This module explores ${moduleTitle} within the context of ${topic}. You'll learn about key concepts, principles, and practical applications related to ${topic}, building a solid foundation for further study.`;
    }
    
    return description;
  } catch (error) {
    console.error('AI Module Description Generation Error:', error.message);
    return `This module covers ${moduleTitle} in ${topic}. You'll learn essential principles, practical examples, and real-world applications related to ${topic}.`;
  }
};

/**
 * Generate detailed section content (helper function)
 */
const generateDetailedSectionContent = (topic, heading, level) => {
  const headingLower = heading.toLowerCase();
  
  if (headingLower.includes('what is') || headingLower.includes('introduction')) {
    return `To truly understand ${topic}, we need to start with its fundamental definition and nature. ${topic} can be defined as a field that encompasses specific principles, structures, and applications that distinguish it from other areas of study. The core essence of ${topic} lies in understanding its primary components and how they function together as an integrated system. When examining ${topic} at a foundational level, we discover that it consists of distinct elements, each with particular characteristics and roles. These elements interact in specific ways, following established patterns and principles that govern their behavior. For ${level} level learners, grasping these fundamental aspects is essential because they provide the necessary context for understanding more complex topics. The foundational knowledge you gain here will serve as the building blocks for all future learning in ${topic}, making it crucial to develop a clear and accurate understanding from the start.`;
  } else if (headingLower.includes('concept') || headingLower.includes('principle')) {
    return `The fundamental concepts of ${topic} represent the core ideas that define and structure the entire field. These concepts are not isolated facts but interconnected principles that form a coherent framework for understanding. Each concept within ${topic} has specific attributes, relationships, and applications that give it meaning and importance. When we study these concepts, we're not just memorizing definitions but understanding how they relate to each other and to the broader field. The relationships between concepts are particularly significant because they reveal the underlying structure of ${topic} and show how different aspects connect. For ${level} level students, mastering these core concepts is fundamental because they appear throughout the subject and form the basis for more advanced learning. Understanding these concepts deeply, rather than superficially, enables you to see patterns and make connections that enhance your overall comprehension of ${topic}.`;
  } else if (headingLower.includes('how') || headingLower.includes('work')) {
    return `The operational mechanisms of ${topic} function through specific processes and systems that follow defined patterns and principles. Understanding how ${topic} works requires examining these processes systematically, identifying the key components involved and tracing how they interact. The functionality depends on various factors working together in coordinated sequences, where each step builds upon the previous one. These processes follow logical progressions that, when understood, reveal the underlying structure and purpose of ${topic}. The mechanisms operate according to established rules and principles that govern their behavior, creating predictable and understandable patterns. For ${level} level learners, breaking these complex processes into smaller, manageable components helps build understanding incrementally. As you study these mechanisms, you'll begin to recognize patterns and principles that apply broadly, helping you understand not just how ${topic} works in specific cases, but the general principles that govern its operation.`;
  } else if (headingLower.includes('application') || headingLower.includes('example')) {
    return `The practical applications of ${topic} demonstrate its real-world value and show how theoretical knowledge translates into useful solutions. These applications span various contexts and situations, each illustrating different aspects of how ${topic} functions in practice. When we examine real-world uses, we see how the principles and concepts we've learned apply to actual problems and needs. Some applications are direct and straightforward, while others involve more complex implementations that require deeper understanding and creative problem-solving. The diversity of applications highlights the versatility of ${topic} and its relevance across different fields, industries, and situations. By studying these practical examples, you gain valuable insight into how ${topic} functions in real scenarios, which reinforces your theoretical knowledge and demonstrates the practical significance of what you're learning. Understanding these applications helps bridge the gap between theory and practice, making your knowledge more complete and useful.`;
  } else {
    return `This section provides comprehensive coverage of important aspects within ${topic}, presenting detailed information that builds your understanding systematically. ${topic} contains numerous interconnected elements that form a cohesive whole, and understanding these connections is essential for mastering the subject. The information presented here covers fundamental knowledge that serves as the foundation for more advanced study, ensuring you have the necessary background to progress effectively. Each piece of information relates to others in meaningful ways, creating a comprehensive framework that supports deeper understanding. As you work through this content, you'll notice how different ideas connect and support each other, creating a network of knowledge rather than isolated facts. This interconnected nature makes learning more effective because new information builds naturally on what you've already learned, creating a cumulative understanding that grows stronger over time. For ${level} level students, this systematic approach ensures you develop a thorough and accurate understanding of ${topic} that will support all your future learning.`;
  }
};

/**
 * Generate detailed content for a specific module
 * @param {string} moduleTitle - The title of the module
 * @param {string} topic - The main topic/subject
 * @param {string} level - User's current level
 * @param {string} learningStyle - User's preferred learning style
 */
const generateModuleContent = async (moduleTitle, topic, level = 'beginner', learningStyle = 'visual') => {
  try {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === '') {
      console.log('⚠️  OpenAI API key not set, using fallback content');
      return {
        title: moduleTitle,
        content: `This module covers ${moduleTitle} in detail. You'll learn about key concepts, practical examples, and real-world applications. The content is designed for ${level} level learners with a focus on ${learningStyle} learning style.`,
        sections: [
          {
            heading: 'Introduction',
            content: `Welcome to ${moduleTitle}. This section introduces the fundamental concepts you'll be learning.`
          },
          {
            heading: 'Key Concepts',
            content: `Here you'll explore the main ideas and principles related to ${topic}.`
          },
          {
            heading: 'Practical Examples',
            content: `Learn through hands-on examples that demonstrate how these concepts work in practice.`
          }
        ]
      };
    }

    const prompt = `Create comprehensive, detailed educational content about ${topic} for a module titled "${moduleTitle}".

Student level: ${level}
Learning style: ${learningStyle}

IMPORTANT: Write actual detailed content about ${topic} - include real facts, concepts, definitions, examples, and explanations. Do NOT just repeat the topic name or write generic statements.

Required structure:
{
  "title": "${moduleTitle}",
  "content": "Write 2-3 detailed paragraphs about ${topic}. Explain what ${topic} is, why it's important, and what students will learn. Include specific information about ${topic}, not generic statements.",
  "sections": [
    {
      "heading": "A specific aspect of ${topic} (e.g., 'What is ${topic}?' or 'History of ${topic}' or 'Types of ${topic}')",
      "content": "Write 4-5 detailed paragraphs with actual information about ${topic}. Include facts, definitions, examples, explanations. Each paragraph should be substantial (3-4 sentences minimum). Write about the actual subject matter of ${topic}, not generic learning content."
    },
    {
      "heading": "Another specific aspect (e.g., 'Key Components of ${topic}' or 'How ${topic} Works')",
      "content": "Write 4-5 detailed paragraphs explaining this aspect of ${topic}. Include specific details, processes, mechanisms, or concepts. Be concrete and informative about ${topic}."
    },
    {
      "heading": "Another specific aspect (e.g., 'Applications of ${topic}' or 'Examples of ${topic}')",
      "content": "Write 4-5 detailed paragraphs with real examples and applications of ${topic}. Include specific use cases, scenarios, or instances related to ${topic}."
    },
    {
      "heading": "Another specific aspect (e.g., 'Important Concepts in ${topic}' or 'Principles of ${topic}')",
      "content": "Write 4-5 detailed paragraphs covering important concepts or principles. Explain them in detail with examples related to ${topic}."
    }
  ]
}

CRITICAL: 
- Each section's content must be 4-5 substantial paragraphs (not just 1-2 sentences)
- Include actual facts, definitions, and information about ${topic}
- Write as if teaching someone about ${topic} - be informative and detailed
- Do NOT write generic statements like "you'll learn about ${topic}" - write the actual content about ${topic}
- Each paragraph should be 3-4 sentences with real information

Respond with ONLY valid JSON, no markdown, no code blocks.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are an expert teacher and content creator specializing in ${topic}. Your task is to write actual educational content about ${topic} - include real facts, definitions, concepts, examples, and detailed explanations. Do NOT write generic statements like "you'll learn about ${topic}" or "this section covers ${topic}". Instead, write the actual content: explain what ${topic} is, how it works, what its components are, give real examples, provide definitions, explain concepts. Write as if you're teaching someone who knows nothing about ${topic} - be informative, detailed, and specific. Always respond with valid JSON only, no markdown formatting.` },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000
    });

    let response = completion.choices[0].message.content.trim();
    
    // Remove markdown code blocks if present
    if (response.startsWith('```json')) {
      response = response.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (response.startsWith('```')) {
      response = response.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    try {
      const parsed = JSON.parse(response);
      
      // Validate content - ensure it's about the actual topic
      if (!parsed.content || parsed.content.trim().length < 50) {
        parsed.content = `Welcome to ${moduleTitle} in ${topic}. This comprehensive module will guide you through essential concepts about ${topic}, including practical examples and real-world applications. You'll gain a deep understanding of ${topic} through structured learning and hands-on practice.`;
      }
      
      // Validate sections - ensure they exist and have content
      if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        console.warn('No sections found in AI response, creating default sections');
        parsed.sections = [
          {
            heading: `What is ${topic}?`,
            content: `${topic} is a fascinating field of study that encompasses many important concepts and principles. In this section, we'll explore the fundamental nature of ${topic}, its core definitions, and why it's important to understand. You'll learn about the basic building blocks of ${topic} and how they form the foundation for more advanced study. This knowledge will help you grasp the bigger picture and see how different aspects of ${topic} connect together.`
          },
          {
            heading: `Key Concepts in ${topic}`,
            content: `Understanding ${topic} requires familiarity with several key concepts. In this section, we'll dive deep into the most important ideas and principles that define ${topic}. Each concept builds upon the others, creating a comprehensive framework for understanding. We'll explore how these concepts work together, their relationships, and their significance. By the end of this section, you'll have a solid grasp of the essential elements that make up ${topic}.`
          },
          {
            heading: `How ${topic} Works`,
            content: `Now that we understand the basics, let's explore how ${topic} actually works in practice. This section explains the mechanisms, processes, and systems involved in ${topic}. We'll look at real-world examples and see how theory translates into practice. You'll learn about the various approaches, methods, and techniques used in ${topic}, and understand when and why each is appropriate. This practical knowledge will help you apply what you've learned.`
          },
          {
            heading: `Applications and Examples of ${topic}`,
            content: `One of the best ways to understand ${topic} is through real-world applications. In this section, we'll examine practical examples and case studies that demonstrate ${topic} in action. You'll see how the concepts we've discussed are used in various contexts, from everyday situations to specialized applications. These examples will help solidify your understanding and show you the relevance and importance of ${topic} in the real world.`
          },
          {
            heading: `Advanced Topics in ${topic}`,
            content: `As you progress in your understanding of ${topic}, you'll encounter more complex and advanced topics. This section introduces some of these sophisticated concepts and prepares you for deeper study. We'll explore cutting-edge developments, advanced techniques, and emerging trends in ${topic}. While these topics may seem challenging at first, they build naturally on the foundation we've established, opening up new possibilities for learning and application.`
          }
        ];
      } else {
        // Validate each section has substantial content
        parsed.sections = parsed.sections.map((section, index) => {
          const contentLength = section.content ? section.content.trim().length : 0;
          
          // Check if content is too generic (just repeats topic name without actual information)
          const contentLower = section.content ? section.content.toLowerCase() : '';
          const topicMentions = section.content ? section.content.split(' ').filter(word => word.toLowerCase() === topic.toLowerCase()).length : 0;
          
          // Detect generic content patterns
          const genericPatterns = [
            'you\'ll learn about',
            'this section covers',
            'we\'ll explore',
            'you\'ll understand',
            'this module will',
            'in this section'
          ];
          
          const hasGenericPattern = genericPatterns.some(pattern => contentLower.includes(pattern)) && contentLength < 400;
          const isTooRepetitive = topicMentions > 8 && contentLength < 500; // Too many topic mentions but not enough content
          const isTooShort = contentLength < 300;
          const isGeneric = hasGenericPattern || isTooRepetitive || isTooShort;
          
          if (!section.heading || !section.content || isGeneric) {
            console.warn(`Section ${index + 1} "${section.heading}" has generic/insufficient content (${contentLength} chars, ${topicMentions} topic mentions), replacing with detailed content`);
            
            // Generate topic-specific content based on section heading
            const heading = section.heading || `Section ${index + 1}`;
            section.content = generateDetailedSectionContent(topic, heading, level);
          } else {
            console.log(`Section ${index + 1} "${section.heading}" has good content (${contentLength} chars)`);
          }
          return section;
        });
      }
      
      console.log(`Generated ${parsed.sections.length} sections for module about ${topic}`);
      
      return parsed;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Response was:', response);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('AI Module Content Generation Error:', error.message);
    // Return fallback content
    return {
      title: moduleTitle,
      content: `This comprehensive module covers ${moduleTitle} in ${topic}. You'll learn about key concepts related to ${topic}, explore practical examples, and understand real-world applications of ${topic}. The content is structured for ${level} level learners and incorporates ${learningStyle} learning techniques to help you master ${topic} effectively.`,
      sections: [
        {
          heading: `Introduction to ${topic}`,
          content: `Welcome to ${moduleTitle} in ${topic}. This module provides a comprehensive introduction to ${topic}, covering essential concepts and foundational knowledge about ${topic}. You'll build a solid understanding of ${topic} that prepares you for more advanced learning.`
        },
        {
          heading: `Key Concepts of ${topic}`,
          content: `In this section, you'll explore the main concepts and principles of ${topic}. We'll break down complex ideas about ${topic} into understandable parts, using clear explanations and relevant examples related to ${topic} to illustrate each point.`
        },
        {
          heading: `Practical Examples of ${topic}`,
          content: `Learn through hands-on examples and real-world scenarios involving ${topic}. This section demonstrates how theoretical knowledge about ${topic} applies in practice, helping you connect ${topic} concepts to actual situations.`
        },
        {
          heading: `Summary and Next Steps in ${topic}`,
          content: `This final section summarizes what you've learned about ${topic} and provides guidance on how to continue your learning journey with ${topic}. You'll understand how this module connects to the broader learning path about ${topic}.`
        }
      ]
    };
  }
};

module.exports = {
  generateLearningContent,
  generateQuizQuestions,
  getTutoringExplanation,
  generateModuleContent,
  generateIntroductionContent,
  generateSectionContent,
  extractTopicAndSectionType,
  extractTopicFromHeading
};
