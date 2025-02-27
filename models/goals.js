const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const goals = db.define("goals", {
  goalId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  goalName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  goalNameSlug: {
    type: sequelize.STRING,
    allowNull: true,
  },
  idealCompletionTime: {
    type: sequelize.STRING,
    allowNull: true,
  },
  shortDescription: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  description: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  thumbnail: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  qualificationId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  jobsAvailable: {
    type: sequelize.STRING,
    allowNull: true,
  },
  highestSalary: {
    type: sequelize.STRING,
    allowNull: true,
  },
  averageSalary: {
    type: sequelize.STRING,
    allowNull: true,
  },
  motive: {
    type: sequelize.STRING,
    allowNull: true,
  },
  faqs: {
    type: sequelize.JSON,
    allowNull: true,
    defaultValue: []
  },
  isActive: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
});

module.exports = goals;
