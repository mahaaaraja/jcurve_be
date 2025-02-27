const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const skills = require("./skills");
const goals = require("./goals");
const categories = require("./categories");

const courseQuiz = db.define('course_quiz', {
  quizId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: true
  },
  level: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  duration: {
    type: sequelize.INTEGER,
    defaultValue: 0
  },
  totalMarks: {
    type: sequelize.INTEGER,
    defaultValue: 0
  },
  totalQuestions: {
    type: sequelize.INTEGER,
    defaultValue: 0
  },
  goalId: {
    type: sequelize.INTEGER,
    allowNull: true
  },
  categoryId: {
    type: sequelize.INTEGER,
    allowNull: true
  }
});

const quizQuestions = db.define('quiz_questions', {
  questionId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quizId: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  question: {
    type: sequelize.TEXT,
    allowNull: false
  },
  optionA: {
    type: sequelize.TEXT,
    allowNull: true
  },
  optionB: {
    type: sequelize.TEXT,
    allowNull: true
  },
  optionC: {
    type: sequelize.TEXT,
    allowNull: true
  },
  optionD: {
    type: sequelize.TEXT,
    allowNull: true
  },
  answer: {
    type: sequelize.STRING,
    allowNull: false
  },
  marks: {
    type: sequelize.INTEGER,
    defaultValue: 1
  },
  difficultyLevel: { // 1-5
    type: sequelize.INTEGER,
    defaultValue: 1
  },
  questionLevel: { // beginner / intermediate / advanced / expert
    type: sequelize.STRING,
    allowNull: false,
    defaultValue: "beginner"
  }
});

const quizTrack = db.define('quiz_tracks', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  quizId: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  remainingTime: {
    type: sequelize.BIGINT,
    allowNull: false
  },
  isSubmitted: {
    type: sequelize.BOOLEAN,
    defaultValue: false
  },
  securedMarks: {
    type: sequelize.INTEGER,
    defaultValue: 0
  },
  assignedQuestionIds: {
    type: sequelize.JSON,
    allowNull: true
  }
});

const questionTrack = db.define('question_tracks', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  quizId: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  questionId: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  isSkipped: {
    type: sequelize.BOOLEAN,
    defaultValue: false
  },
  userAnswer: {
    type: sequelize.STRING,
    allowNull: false,
    defaultValue: "",
  },
  underReview: {
    type: sequelize.BOOLEAN,
    defaultValue: 0
  }
});

quizQuestions.belongsTo(courseQuiz, { foreignKey: "quizId", onDelete: "CASCADE" });
questionTrack.belongsTo(quizQuestions, { foreignKey: "questionId", onDelete: "CASCADE" });
quizTrack.belongsTo(courseQuiz, { foreignKey: "quizId", onDelete: "CASCADE" });
courseQuiz.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });
courseQuiz.belongsTo(goals, { foreignKey: "goalId", onDelete: "CASCADE" });
courseQuiz.belongsTo(categories, { foreignKey: "categoryId", onDelete: "CASCADE" });

module.exports = { quizQuestions, courseQuiz, quizTrack, questionTrack }