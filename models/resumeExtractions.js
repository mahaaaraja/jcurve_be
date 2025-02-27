const sequelize = require("sequelize");
const db = require("../util/dbConnection");

// storing all the data received from resume extraction
const resumeExtractions = db.define("resume_extractions", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  email: {
    type: sequelize.STRING,
    allowNull: true,
  },
  resumeFileName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  rawData: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  parsedData: {
    type: sequelize.JSON,
    allowNull: true,
  }
});

module.exports = resumeExtractions;