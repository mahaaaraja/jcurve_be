const sequelize = require("sequelize");
const db = require("../util/dbConnection");

// segregating by skill & storing the data received from testlify webhook
const userAssessmentSubCategoryWiseResults = db.define("user_assessment_sub_category_wise_results", {
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
    vendorAssessmentId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    userAssessmentId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    subCategoryId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    subCategoryName: {
        type: sequelize.STRING,
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
            fields: ['userId', 'userAssessmentId', 'subCategoryId']
        }
    ]
});

module.exports = userAssessmentSubCategoryWiseResults;
