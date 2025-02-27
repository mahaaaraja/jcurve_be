const sequelize = require("sequelize");
const db = require("../util/dbConnection");

// segregating by skill & storing the data received from testlify webhook
const userAssessmentSkillWiseResults = db.define("user_assessment_skill_wise_results", {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    userAssessmentId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    skillId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    totalQuestions: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    attemptedQuestions: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    correctQuestions: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    wrongQuestions: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    percentage: {
        type: sequelize.INTEGER,
        allowNull: true,
    }
}, {
    indexes: [
        {
            name: 'unique_idx',
            unique: true,
            fields: ['userId', 'userAssessmentId', 'skillId']
        }
    ]
});

module.exports = userAssessmentSkillWiseResults;
