const sequelize = require('sequelize');
const db = require('../util/dbConnection');
const { jobs } = require('./jobs');
const skills = require('./skills');

const jobSkills = db.define('job_skills', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  requiredSkillLevel: {
    type: sequelize.STRING,
    defaultValue: 7
  },
  isGoatSkill: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isIndustrySkill: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isIdealProfileSkill: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  isCurriculumSkill: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
});

jobSkills.belongsTo(jobs, { foreignKey: "jobId", onDelete: "CASCADE" });
jobSkills.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });

module.exports = jobSkills;