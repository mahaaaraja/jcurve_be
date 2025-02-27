const sequelize = require('sequelize');
const db = require('../util/dbConnection');
const users = require('./users');
const goals = require('./goals');
const jobs = require('./jobs');

const userJobMetrics = db.define('user_job_metrics', {
	ujmId: {
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
		allowNull: true,
	},
	goalId: {
		type: sequelize.INTEGER,
		allowNull: false,
	},
	userExperienceInMonths: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	jobExperienceInMonths: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	experienceMatchInPercentage: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	// userExpectedSalary: {
	// 	type: sequelize.INTEGER,
	// 	allowNull: true,
	// },
	// jobProvidedSalary: {
	// 	type: sequelize.INTEGER,
	// 	allowNull: true,
	// },
	salaryMatchInPercentage: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	missingSkills: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	avgTrainingTime: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	locationMatchPercent: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	isLocalLocation: {
		type: sequelize.BOOLEAN,
		allowNull: true,
	}, 
	coreSkillPercent: { // Core Skill Percent
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	verifiedSkillsCount: { // normal match
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	unverifiedSkillsCount: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	verifiedSkillsLevelMatchCount: { // level match
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	unverifiedSkillsLevelMatchCount: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	verifiedSkillMatchPercent: {
		type: sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0,
	},
	unverifiedSkillMatchPercent: {
		type: sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0,
	},
	verifiedSkillLevelMatchPercent: {
		type: sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0,
	},
	unverifiedSkillLevelMatchPercent: {
		type: sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0,
	},
	unifiedVerifiedSkillMatchPercent: {
		type: sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0,
	},
	unifiedUnverifiedSkillMatchPercent: {
		type: sequelize.FLOAT,
		allowNull: true,
		defaultValue: 0,
	},
	totalJobSkillsCount: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
});

userJobMetrics.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });
userJobMetrics.belongsTo(goals, { foreignKey: 'goalId', onDelete: 'CASCADE' });
// userJobMetrics.belongsTo(jobs, { foreignKey: 'jobId', onDelete: 'CASCADE' });

module.exports = userJobMetrics;
