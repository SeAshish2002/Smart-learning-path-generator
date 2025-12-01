// Module Detail page - displays detailed AI-generated module content
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './ModuleDetail.css';

const ModuleDetail = () => {
  const { id, moduleIndex } = useParams();
  const [learningPath, setLearningPath] = useState(null);
  const [moduleContent, setModuleContent] = useState(null);
  const [introductionContent, setIntroductionContent] = useState(null);
  const [expandedSections, setExpandedSections] = useState({}); // Track which sections are expanded
  const [sectionContents, setSectionContents] = useState({}); // Store generated content for each section
  const [generatingSections, setGeneratingSections] = useState({}); // Track which sections are generating
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingIntro, setGeneratingIntro] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id, moduleIndex]);

  const fetchData = async () => {
    try {
      const pathRes = await axios.get(`/learning-paths/${id}`);
      setLearningPath(pathRes.data.learningPath);
      
      const modules = pathRes.data.learningPath.content?.modules || [];
      const module = modules[parseInt(moduleIndex)];
      
      if (module) {
        // Get the actual topic
        const actualTopic = pathRes.data.learningPath.subject || pathRes.data.learningPath.topic || pathRes.data.learningPath.title?.replace(' Learning Path', '') || 'the subject';
        
        // Generate introduction content separately
        generateIntroductionContent(actualTopic, module.title, pathRes.data.learningPath.difficulty || 'beginner');
        
        // Check if detailed content already exists
        if (module.detailedContent) {
          setModuleContent(module.detailedContent);
          setLoading(false);
        } else {
          // Generate detailed content (sections only, introduction is generated separately)
          generateDetailedContent(module, pathRes.data.learningPath);
        }
      } else {
        setError('Module not found');
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to load module');
      console.error(error);
      setLoading(false);
    }
  };

  // Generate introduction content separately
  const generateIntroductionContent = async (topic, subtopic, level) => {
    setGeneratingIntro(true);
    
    try {
      const response = await axios.post('/ai/generate-introduction', {
        topic: topic,
        subtopic: subtopic,
        level: level || 'beginner'
      });
      
      setIntroductionContent(response.data.introduction);
      console.log('Introduction content generated:', response.data.introduction);
    } catch (error) {
      console.error('Error generating introduction:', error);
      // Use fallback
      setIntroductionContent(`Welcome to ${subtopic}. This module provides a comprehensive introduction to ${topic}, covering essential concepts and foundational knowledge. You'll build a solid understanding of ${topic} that prepares you for more advanced learning.`);
    } finally {
      setGeneratingIntro(false);
    }
  };

  // Generate section content when user clicks on a section
  const handleSectionClick = async (sectionIndex, sectionHeading) => {
    // If already expanded, collapse it
    if (expandedSections[sectionIndex]) {
      setExpandedSections({ ...expandedSections, [sectionIndex]: false });
      return;
    }

    // If content already generated, just expand
    if (sectionContents[sectionIndex]) {
      setExpandedSections({ ...expandedSections, [sectionIndex]: true });
      return;
    }

    // Generate new content
    setGeneratingSections({ ...generatingSections, [sectionIndex]: true });
    setError(''); // Clear any previous errors
    
    try {
      // Get subject (e.g., "Mathematics", "Science")
      const subject = learningPath?.subject || learningPath?.topic || learningPath?.title?.replace(' Learning Path', '') || 'the subject';
      
      // Extract actual topic name from section heading
      // Example: "Getting Started with algebra" -> "algebra"
      // Example: "Key Concepts of mathematics" -> "mathematics" (or extract from module if available)
      let topicName = sectionHeading;
      
      // Remove common prefixes from section heading
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
      
      const headingLower = sectionHeading.toLowerCase();
      for (const prefix of prefixes) {
        if (headingLower.startsWith(prefix)) {
          topicName = sectionHeading.substring(prefix.length).trim();
          break;
        }
      }
      
      // If section heading has "X of Y" pattern, extract Y
      if (topicName === sectionHeading && headingLower.includes(' of ')) {
        const parts = sectionHeading.split(' of ');
        if (parts.length > 1) {
          topicName = parts[parts.length - 1].trim();
        }
      }
      
      // If topicName matches subject exactly, try to get from module title
      if (topicName.toLowerCase() === subject.toLowerCase() && moduleContent?.title) {
        const moduleTitle = moduleContent.title;
        const moduleLower = moduleTitle.toLowerCase();
        
        // Try to extract from module title
        for (const prefix of prefixes) {
          if (moduleLower.startsWith(prefix)) {
            topicName = moduleTitle.substring(prefix.length).trim();
            break;
          }
        }
        
        // If module title has "X of Y", extract Y
        if (topicName.toLowerCase() === subject.toLowerCase() && moduleLower.includes(' of ')) {
          const parts = moduleTitle.split(' of ');
          if (parts.length > 1) {
            topicName = parts[parts.length - 1].trim();
          }
        }
      }
      
      // If we still don't have a good topic name, use subject as fallback
      if (!topicName || topicName.toLowerCase() === subject.toLowerCase()) {
        topicName = subject;
      }
      
      const level = learningPath?.difficulty || 'beginner';
      
      console.log('Generating section content:', { 
        subject, 
        topic: topicName,  // This is the actual topic name (e.g., "Algebra")
        sectionHeading,    // This is the UI label (e.g., "Getting Started with algebra")
        level
      });
      
      const response = await axios.post('/ai/generate-section', {
        subject: subject,        // Subject (e.g., "Mathematics")
        topic: topicName,        // Actual topic name (e.g., "Algebra") - NOT the section heading
        level: level
      });
      
      console.log('Section content response:', response.data);
      
      if (response.data && response.data.content) {
        // Store the generated content
        setSectionContents({ ...sectionContents, [sectionIndex]: response.data.content });
        // Expand the section
        setExpandedSections({ ...expandedSections, [sectionIndex]: true });
        console.log(`Section ${sectionIndex} content generated successfully:`, response.data.content.substring(0, 100) + '...');
      } else {
        throw new Error('Invalid response format: content not found');
      }
    } catch (error) {
      console.error('Error generating section content:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(`Failed to generate section content: ${error.response?.data?.message || error.message || 'Unknown error'}`);
      // Still expand to show error message
      setExpandedSections({ ...expandedSections, [sectionIndex]: true });
      // Set a fallback content
      setSectionContents({ 
        ...sectionContents, 
        [sectionIndex]: `Error: Could not generate content for "${sectionHeading}". Please try again or check your connection.` 
      });
    } finally {
      setGeneratingSections({ ...generatingSections, [sectionIndex]: false });
    }
  };

  const generateDetailedContent = async (module, learningPath) => {
    setGenerating(true);
    setError('');
    
    try {
      // Get the actual topic from the learning path - use subject or topic field
      const actualTopic = learningPath.subject || learningPath.topic || learningPath.title?.replace(' Learning Path', '') || 'the subject';
      
      const response = await axios.post('/ai/generate-module', {
        moduleTitle: module.title,
        topic: actualTopic, // Use the actual topic the user entered
        level: learningPath.difficulty || 'beginner',
        learningStyle: 'visual' // You can get this from user profile
      });
      
      const content = response.data.content;
      console.log('Received module content:', content);
      console.log('Sections count:', content.sections?.length || 0);
      
      // Ensure sections exist (but don't use content.content for intro - it's generated separately)
      if (!content.sections || content.sections.length === 0) {
        console.warn('No sections in response, adding default sections');
        content.sections = [
          {
            heading: 'Key Concepts',
            content: 'Content is being generated...'
          }
        ];
      }
      
      // Set module content (introduction is stored separately in introductionContent state)
      setModuleContent({
        ...content,
        content: introductionContent || content.content // Use generated introduction if available
      });
    } catch (error) {
      console.error('Error generating module content:', error);
      setError('Failed to generate detailed content. Please try again.');
      // Use basic content as fallback with multiple sections
      const fallbackTopic = learningPath.subject || learningPath.topic || 'the subject';
      setModuleContent({
        title: module.title,
        content: introductionContent || module.content || `This module covers ${module.title} in ${fallbackTopic}.`,
        sections: [
          {
            heading: `Introduction to ${fallbackTopic}`,
            content: `Welcome to ${module.title}. This section provides a comprehensive introduction to ${fallbackTopic}, covering essential concepts and foundational knowledge. You'll learn about the fundamental principles that form the basis of ${fallbackTopic} and understand how they apply in various contexts. This foundation will prepare you for more advanced topics and help you build a strong understanding of ${fallbackTopic}.`
          },
          {
            heading: `Key Concepts of ${fallbackTopic}`,
            content: `In this section, we'll explore the main concepts and principles related to ${fallbackTopic}. These key ideas are essential for understanding how ${fallbackTopic} works and why it's important. We'll break down complex topics into understandable parts, using clear explanations and relevant examples. By the end of this section, you'll have a solid grasp of the core concepts that define ${fallbackTopic}.`
          },
          {
            heading: `How ${fallbackTopic} Works`,
            content: `Understanding the mechanics of ${fallbackTopic} is crucial for mastery. This section explains the processes, systems, and mechanisms involved in ${fallbackTopic}. You'll learn how different elements interact, what drives the processes, and how they function in practice. Through detailed explanations and examples, you'll gain insight into the inner workings of ${fallbackTopic}.`
          },
          {
            heading: `Practical Applications`,
            content: `Learning about ${fallbackTopic} becomes meaningful when you see how it applies in real-world situations. This section presents practical examples, case studies, and applications of ${fallbackTopic}. You'll see how theoretical knowledge translates into practice and understand the relevance of ${fallbackTopic} in various contexts. These examples will help solidify your understanding and demonstrate the practical value of what you're learning.`
          }
        ]
      });
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  if (loading || generating || generatingIntro) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        {(generating || generatingIntro) && <p>Generating AI-powered content...</p>}
      </div>
    );
  }

  if (error && !moduleContent) {
    return (
      <div className="container">
        <div className="error">{error}</div>
        <Link to={`/learning-path/${id}`} className="btn btn-primary">
          Back to Learning Path
        </Link>
      </div>
    );
  }

  if (!moduleContent) {
    return (
      <div className="container">
        <div className="error">Module content not available</div>
        <Link to={`/learning-path/${id}`} className="btn btn-primary">
          Back to Learning Path
        </Link>
      </div>
    );
  }

  return (
    <div className="module-detail-page">
      <div className="container">
        <Link to={`/learning-path/${id}`} className="back-link">
          ← Back to Learning Path
        </Link>
        
        <div className="module-header">
          <h1>{moduleContent.title}</h1>
          {learningPath && (
            <p className="module-subject">{learningPath.subject} • Module {parseInt(moduleIndex) + 1}</p>
          )}
        </div>

        {error && <div className="error">{error}</div>}

        <div className="module-intro">
          {introductionContent ? (
            <div>
              {introductionContent.split('\n\n').map((paragraph, pIndex) => (
                paragraph.trim() && (
                  <p key={pIndex}>{paragraph.trim()}</p>
                )
              ))}
            </div>
          ) : (
            <p>{moduleContent.content}</p>
          )}
        </div>

        <div className="module-sections">
          {moduleContent.sections && moduleContent.sections.length > 0 ? (
            moduleContent.sections.map((section, index) => {
              const isExpanded = expandedSections[index];
              const hasGeneratedContent = sectionContents[index];
              const isGenerating = generatingSections[index];
              const sectionHeading = section.heading || `Section ${index + 1}`;
              
              return (
                <div key={index} className="section-card">
                  <div className="section-header-with-button">
                    <h2>{sectionHeading}</h2>
                    <button
                      onClick={() => handleSectionClick(index, sectionHeading)}
                      className="btn btn-section-expand"
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        'Generating...'
                      ) : isExpanded ? (
                        '▼ Hide Content'
                      ) : (
                        '▶ Explore This Section'
                      )}
                    </button>
                  </div>
                  
                  {/* Show preview content when not expanded */}
                  {!isExpanded && (
                    <div className="section-preview">
                      {section.content ? (
                        <p>{section.content.substring(0, 150)}...</p>
                      ) : (
                        <p>Click "Explore This Section" to generate detailed content about {sectionHeading}.</p>
                      )}
                    </div>
                  )}
                  
                  {/* Show detailed content when expanded */}
                  {isExpanded && (
                    <div className="section-content">
                      {isGenerating ? (
                        <div className="loading-section">
                          <p>Generating AI content... Please wait.</p>
                        </div>
                      ) : hasGeneratedContent ? (
                        <div>
                          {sectionContents[index].split('\n\n').map((paragraph, pIndex) => (
                            paragraph.trim() && (
                              <p key={pIndex}>{paragraph.trim()}</p>
                            )
                          ))}
                        </div>
                      ) : section.content ? (
                        <div>
                          {section.content.split('\n\n').map((paragraph, pIndex) => (
                            paragraph.trim() && (
                              <p key={pIndex}>{paragraph.trim()}</p>
                            )
                          ))}
                        </div>
                      ) : (
                        <p>Content for this section is being generated...</p>
                      )}
                      {error && index === Object.keys(expandedSections).find(k => expandedSections[k]) && (
                        <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>
                          {error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card">
              <p>No sections available. Content is being generated...</p>
            </div>
          )}
        </div>

        <div className="module-footer">
          <Link to={`/learning-path/${id}`} className="btn btn-secondary">
            Back to Modules
          </Link>
          <button
            onClick={async () => {
              try {
                const modules = learningPath.content?.modules || [];
                const progress = Math.min(100, ((parseInt(moduleIndex) + 1) / modules.length) * 100);
                await axios.put(`/learning-paths/${id}/progress`, { progress });
                alert('Module marked as complete!');
              } catch (error) {
                console.error('Error updating progress:', error);
              }
            }}
            className="btn btn-primary"
          >
            Mark Module as Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetail;

