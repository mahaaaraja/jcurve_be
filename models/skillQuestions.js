const sequelize = require('sequelize');
const db = require("../util/dbConnection");

const questions = require("./questions");
const skills = require("./skills");

const skillQuestions = db.define("skill_questions", {
  skillQuestionId: {
    type: sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  questionId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  skillLevel: {
    type: sequelize.INTEGER,
    defaultValue: 7,
  },
});

skillQuestions.belongsTo(questions, { foreignKey: "questionId", onDelete: "CASCADE" });
skillQuestions.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });

module.exports = skillQuestions;