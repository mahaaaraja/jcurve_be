const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const questions = db.define('questions', {
  questionId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
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
  isApproved: {
    type: sequelize.BOOLEAN,
    defaultValue: false
  },
  questionType: {
    type: sequelize.STRING,
    defaultValue: "MCQ",
  },
});

module.exports = questions;