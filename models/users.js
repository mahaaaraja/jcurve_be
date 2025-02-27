const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const users = db.define("users", {
  userId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  email: {
    type: sequelize.STRING,
    allowNull: true,
  },
  password: {
    type: sequelize.STRING,
    allowNull: true,
  },
  secondaryEmail: {
    type: sequelize.STRING,
    allowNull: true,
  },
  uniqueId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  countryCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: sequelize.STRING,
    allowNull: true,
  },
  mode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  isVerified: {
    type: sequelize.STRING,
    allowNull: false,
    defaultValue: 0
  },
  profilePicture: {
    type: sequelize.STRING,
    allowNull: true,
  },
  profileCompletionPercent: {
    type: sequelize.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  jcurveCredits: {
    comment: 'base64 format',
    type: sequelize.STRING,
    allowNull: true,
    defaultValue: 'MA=='
  },
  registerStep: {
    type: sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isActive: {
    type: sequelize.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = users;
