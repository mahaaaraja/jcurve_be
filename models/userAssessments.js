const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const { jobs } = require("./jobs");
const payments = require("./payments");

const userAssessments = db.define("user_assessments", {
    userAssessmentId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    assessmentId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    assessmentName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    orderDetailId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    amount: {
        type: sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    jobId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    assessmentCategory: {
        comment: "Technical or Non-Technical",
        type: sequelize.ENUM('Technical', 'Non-Technical'),
        allowNull: true,
    },
    assessmentProvider: {
        comment: "Testlify/TestGorilla/JCurve",
        type: sequelize.STRING,
        allowNull: false,
    },
    testlifyAssessmentDetailsId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    testlifyAssessmentEmail: {
        type: sequelize.STRING,
        allowNull: true,
    },
    vendorAssessmentId: {
        comment: "Assessment id from testlify portal (alpha numeric string)",
        type: sequelize.STRING,
        allowNull: true,
    },
    assessmentLink: {
        type: sequelize.STRING,
        allowNull: true,
    },
    assessmentType: {
        comment: 'preRoadmap/postRoadmap',
        type: sequelize.ENUM('preRoadmap', 'postRoadmap'),
        allowNull: true,
    },
    assessmentFeeType: {
        comment: 'Sponsored/Paid',
        type: sequelize.ENUM('Sponsored', 'Paid'),
        allowNull: true,
    },
    paymentId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    assessmentStatus: {
        comment: "ENROLLED/INVITED/IN_PROGRESS/DISQUALIFIED/REJECTED/COMPLETED",
        type: sequelize.STRING,
        allowNull: true,
    },
    assessmentReport: {
        type: sequelize.STRING,
        defaultValue: null,
        allowNull: true
    },
    totalQuestion: {
        comment: "number of questions in the assessment",
        type: sequelize.INTEGER,
        allowNull: true,
    },
    totalScore: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    totalScoreAchieved: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    avgScorePercentage: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    totalTestTimeInSec: {
        comment: "assessment time in seconds",
        type: sequelize.INTEGER,
        allowNull: true,
    },
    totalTestElapsedTimeInSec: {
        comment: "time taken by the user to complete the assessment in seconds",
        type: sequelize.INTEGER,
        allowNull: true,
    },
    remainingTime: {
        comment: "remaining time in seconds",
        type: sequelize.INTEGER,
        allowNull: true,
    },
    assessmentSkillIds: {
        type: sequelize.JSON,
        allowNull: true,
    },
    assessmentStartedAt: {
        type: sequelize.DATE,
        allowNull: true
    },
    assessmentSubmittedAt: {
        type: sequelize.DATE,
        allowNull: true
    }
});

module.exports = userAssessments;


userAssessments.belongsTo(jobs, { foreignKey: "jobId", onDelete: "CASCADE" });
userAssessments.belongsTo(payments, { foreignKey: "paymentId", onDelete: "CASCADE" });
