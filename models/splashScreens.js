const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const splashScreens = db.define("splash_screens", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  partnerCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  topImage: {
    type: sequelize.STRING,
    allowNull: true,
  },
  logo: {
    type: sequelize.STRING,
    allowNull: true,
  },
  infoHead: {
    type: sequelize.STRING,
    allowNull: true,
  },
  info: { // any text to be shown in the splash screen
    type: sequelize.STRING,
    allowNull: true,
  }
});

module.exports = splashScreens;