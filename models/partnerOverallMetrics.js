const sequelize = require("sequelize");

const db = require("../util/dbConnection");
const partners = require("./partners");

const partnerOverallMetrics = db.define("partner_overall_metrics", {
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  partnerCode: {
    type: sequelize.STRING,
    allowNull: false,
  },
  totalResumes: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  totalWomenResumes: {
    type: sequelize.INTEGER,
    defaultValue: 0
  },
  activeJobs: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
});

partnerOverallMetrics.belongsTo(partners, { foreignKey: "partnerCode", targetKey: "partnerCode", onDelete: "CASCADE" });

module.exports = partnerOverallMetrics;