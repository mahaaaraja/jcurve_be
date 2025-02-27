const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const assessments = db.define("assessments", {
    assessmentId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    assessmentName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    assessmentCategory: {
        comment: "Technical or Non-Technical",
        type: sequelize.ENUM('Technical', 'Non-Technical'),
        allowNull: true,
    },
    assessmentProvider: {
        comment: "Testlify/TestGorilla",
        type: sequelize.STRING,
        allowNull: false,
    },
    vendorAssessmentId: {
        comment: "Assessment id from testlify portal (alpha numeric string)",
        type: sequelize.STRING,
        allowNull: false,
    },
    type: {
        comment: 'preRoadmap/postRoadmap',
        type: sequelize.ENUM('preRoadmap', 'postRoadmap'),
        allowNull: false,
    },
    assessmentFeeType: {
        comment: 'Sponsored/Paid',
        type: sequelize.ENUM('Sponsored', 'Paid'),
        allowNull: false,
    },
    price: {
        type: sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    assessmentDuration: {
        type: sequelize.STRING,
        allowNull: true,
    },
    numberOfTests: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    numberOfQuestions: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
});

module.exports = assessments;
