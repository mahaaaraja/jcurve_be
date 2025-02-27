const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const components = require("./components");

const componentSettings = db.define("component_settings", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  componentId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  roleId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  partnerCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  isVisible: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
  isEnable: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
  isMasked: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  },
  isMandatory: {
    type: sequelize.BOOLEAN,
    defaultValue: false,
  }
});

module.exports = componentSettings;

componentSettings.belongsTo(components, { foreignKey: 'componentId', onDelete: 'CASCADE' });