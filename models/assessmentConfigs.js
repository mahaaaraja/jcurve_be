const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const assessmentConfigs = db.define("assessment_configs", {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
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
    totalQuestions: {
        type: sequelize.INTEGER,
        defaultValue: 12,
    },
    begineerQuestions: {
        type: sequelize.INTEGER,
        defaultValue: 4,
    },
    intermediateQuestions: {
        type: sequelize.INTEGER,
        defaultValue: 4,
    },
    advanceQuestions: {
        type: sequelize.INTEGER,
        defaultValue: 4,
    },
    totalTime: {
        type: sequelize.INTEGER,
        defaultValue: 4,
    },
    credits: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    partnerCode: {
        type: sequelize.STRING,
        allowNull: true,
        defaultValue: null,
    },
});

module.exports = assessmentConfigs
