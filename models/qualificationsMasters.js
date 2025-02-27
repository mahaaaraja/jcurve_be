const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const qualificationsMasters = db.define("qualifications_masters", {
  qualificationId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  qualification: {
    type: sequelize.STRING,
    allowNull: false,
  },
  isActive: {
    type: sequelize.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = qualificationsMasters;
