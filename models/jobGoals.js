const sequelize = require('sequelize');
const db = require('../util/dbConnection');

const { jobs } = require('./jobs');
const goals = require('./goals');

const jobGoals = db.define('job_goals', {
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
  goalId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
});

jobGoals.belongsTo(jobs, { foreignKey: 'jobId', onDelete: 'CASCADE' });
jobGoals.belongsTo(goals, { foreignKey: 'goalId', onDelete: 'CASCADE' });

module.exports = jobGoals;
