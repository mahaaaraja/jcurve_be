const sequelize = require("sequelize");

const db = require("../util/dbConnection");
const partners = require("./partners");
const { jobs } = require("./jobs");

const partnerJobMetrics = db.define("partner_job_metrics", {
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
  jobId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  totalRegisteredCandidates: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  outreachStatus: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  shortlistedCandidates: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  interviewedCandidates: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  hiredCandidates: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  rtw: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  nonRtw: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
  assessmentTaken: {
    type: sequelize.INTEGER,
    defaultValue: 0,
  },
});

partnerJobMetrics.belongsTo(partners, { foreignKey: "partnerCode", targetKey: "partnerCode", onDelete: "CASCADE" });
partnerJobMetrics.belongsTo(jobs, { foreignKey: "jobId", onDelete: "CASCADE" });

module.exports = partnerJobMetrics;