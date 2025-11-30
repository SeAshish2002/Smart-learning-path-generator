// Models index file - sets up relationships between models
const User = require('./User');
const LearningPath = require('./LearningPath');
const Quiz = require('./Quiz');
const Progress = require('./Progress');
const { StudyGroup, StudyGroupMember } = require('./StudyGroup');

// Define relationships

// User has many LearningPaths
User.hasMany(LearningPath, { foreignKey: 'userId', as: 'learningPaths' });
LearningPath.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User has many Progress records
User.hasMany(Progress, { foreignKey: 'userId', as: 'progress' });
Progress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// LearningPath has many Quizzes
LearningPath.hasMany(Quiz, { foreignKey: 'learningPathId', as: 'quizzes' });
Quiz.belongsTo(LearningPath, { foreignKey: 'learningPathId', as: 'learningPath' });

// LearningPath has many Progress records
LearningPath.hasMany(Progress, { foreignKey: 'learningPathId', as: 'progressRecords' });
Progress.belongsTo(LearningPath, { foreignKey: 'learningPathId', as: 'learningPath' });

// Quiz has many Progress records
Quiz.hasMany(Progress, { foreignKey: 'quizId', as: 'progress' });
Progress.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });

// StudyGroup relationships
User.hasMany(StudyGroup, { foreignKey: 'createdBy', as: 'createdGroups' });
StudyGroup.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Many-to-many: Users and StudyGroups
User.belongsToMany(StudyGroup, { 
  through: StudyGroupMember, 
  foreignKey: 'userId', 
  as: 'studyGroups' 
});
StudyGroup.belongsToMany(User, { 
  through: StudyGroupMember, 
  foreignKey: 'studyGroupId', 
  as: 'members' 
});

module.exports = {
  User,
  LearningPath,
  Quiz,
  Progress,
  StudyGroup,
  StudyGroupMember
};

