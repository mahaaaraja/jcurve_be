const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const collegesMasters = db.define("colleges_masters", {
  collegeId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: true,
    primaryKey: true,
  },
  collegeName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  state: {
    type: sequelize.STRING,
    allowNull: false,
  },
  isActive: {
    type: sequelize.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = collegesMasters;
