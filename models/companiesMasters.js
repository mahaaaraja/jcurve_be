const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const companiesMasters = db.define("companies_masters", {
  companyId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: true,
    primaryKey: true,
  },
  rank: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  companyName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  companyWebsite: {
    type: sequelize.STRING,
    allowNull: true,
  },
  isActive: {
    type: sequelize.BOOLEAN,
    defaultValue: true,
  }
});

module.exports = companiesMasters;
