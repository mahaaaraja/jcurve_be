const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const userActivityLog = db.define('user_activity_log', {
    userActivityLogId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    path: {
        type: sequelize.STRING,
        allowNull: false,
    },
    method: {
        type: sequelize.STRING,
        allowNull: false,
    },
    userAgent: {
        type: sequelize.STRING,
        allowNull: false,
    },
    ipAddress: {
        type: sequelize.STRING,
        allowNull: false,
    },
});

module.exports = userActivityLog;