const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const { jobs } = require("./jobs");

const userAssessmentQuestions = db.define("user_assessment_questions", {
    userAssessmentQuestionId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    userAssessmentId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    userAssessmentTestId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    goalId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    jobId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    categoryId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    subCategoryId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    skillId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    questionId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    userAnswer: {
        type: sequelize.STRING,
        allowNull: true,
    },
    isCorrect: {
        type: sequelize.BOOLEAN,
        allowNull: true,
    },
    score: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    questionStatus: {
        comment: "Attempted/Not Attempted",
        type: sequelize.STRING,
        allowNull: true,
    },
});

module.exports = userAssessmentQuestions;


userAssessmentQuestions.belongsTo(jobs, { foreignKey: "jobId", onDelete: "CASCADE" });
