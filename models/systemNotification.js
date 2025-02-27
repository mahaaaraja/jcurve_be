const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const systemNotification = db.define('system_notification', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  title: {
    type: sequelize.STRING,
    allowNull: false,
  },
  message: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  startTime: {
    type: sequelize.DATE,
    allowNull: true,
  },
  endTime: {
    type: sequelize.DATE,
    allowNull: true,
  },
});

module.exports = systemNotification;