const sequelize = require("sequelize");
const db = require("../util/dbConnection");

// storing all the data received from testlify webhook
const assessmentWebhookDetails = db.define("assessment_webhook_details", {
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
    testlifyAssessmentEmail: {
        type: sequelize.STRING,
        allowNull: true,
    },
    vendorAssessmentId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize.STRING,
        allowNull: true,
    },
    data: {
        type: sequelize.JSON,
        allowNull: true,
    },
}, {
    indexes: [
        {
            name: 'unique_idx',
            unique: true,
            fields: ['userId', 'testlifyAssessmentEmail', 'vendorAssessmentId', 'status']
        }
    ]
});

module.exports = assessmentWebhookDetails;
