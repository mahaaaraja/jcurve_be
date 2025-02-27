const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const components = db.define("components", {
  componentId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  page: {
    type: sequelize.STRING,
    allowNull: true,
  },
  topMenu: {
    type: sequelize.STRING,
    allowNull: true,
  },
  sideMenu: {
    type: sequelize.STRING,
    allowNull: true,
  },
  componentName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  componentNameId: {
    type: sequelize.STRING,
    allowNull: false,
  },
  portalName: { // default: candidate ?
    type: sequelize.STRING,
    allowNull: true,
  },
  partnerCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
});

module.exports = components;
