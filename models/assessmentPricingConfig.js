const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const assessmentPricingConfig = db.define("assessment_pricing_config", {
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
    skillId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    credits: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
});

module.exports = assessmentPricingConfig
