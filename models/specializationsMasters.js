const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const specializationsMasters = db.define("specializations_masters", {
  specializationId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: true,
    primaryKey: true,
  },
  qualificationId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  specialization: {
    type: sequelize.STRING,
    allowNull: false,
  },
  isActive: {
    type: sequelize.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = specializationsMasters;
