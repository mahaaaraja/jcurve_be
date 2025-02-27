const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const auth = db.define("auths", {
  authId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: true,
    primaryKey: true,
  },
  email: {
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
  otp: {
    type: sequelize.INTEGER,
    allowNull: true,
  }
});

module.exports = auth;
