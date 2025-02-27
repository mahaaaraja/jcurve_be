const sequelize = require('sequelize');
const db = require('../util/dbConnection');
const users = require('./users');
const { jobs } = require('./jobs');

const userDreamJobs = db.define('user_dream_jobs', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  jobSkillsCount: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  matchedSkillsCount: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  unmatchedSkillsCount: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  acquiredSkillsCount: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  partiallyAcquiredSkillsCount: {
    type: sequelize.INTEGER,
    allowNull: true,
  }
});

userDreamJobs.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });
userDreamJobs.belongsTo(jobs, { foreignKey: 'jobId', onDelete: 'CASCADE' });

module.exports = userDreamJobs;