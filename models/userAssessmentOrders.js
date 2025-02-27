const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const { duration } = require("moment");
const orderDetails = require("./orderDetails");


const userAssessmentOrders = db.define("user_assessment_orders", {
    userAssessmentTestId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userAssessmentId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    orderDetailId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    testName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    goalId: {
        type: sequelize.INTEGER,
        allowNull: false,
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
    amount: {
        type: sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    assessmentStatus: {
        comment: "ENROLLED/INVITED/IN_PROGRESS/DISQUALIFIED/REJECTED/COMPLETED",
        type: sequelize.STRING,
        allowNull: true,
    },
    duration: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    numberOfQuestions: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    totalMarks: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    totalScoreAchieved: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
});

module.exports = userAssessmentOrders;

// userAssessmentOrders.belongsTo(orderDetails, { foreignKey: "orderDetailId", onDelete: "CASCADE" });