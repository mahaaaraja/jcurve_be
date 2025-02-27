const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const skills = db.define("skills", {
  skillId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  skillName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  skillNameSlug: {
    type: sequelize.STRING,
    allowNull: true,
  },
  skillDescription: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  skillCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  beginnerDescription: {
    type: sequelize.JSON,
    allowNull: true,
  },
  intermediateDescription: {
    type: sequelize.JSON,
    allowNull: true,
  },
  advancedDescription: {
    type: sequelize.JSON,
    allowNull: true,
  },
});

module.exports = skills;