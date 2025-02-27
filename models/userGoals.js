const sequelize = require('sequelize');
const db = require('../util/dbConnection');
const users = require('./users'); // Assuming you have a 'users' model
const goals = require('./goals');

const userGoals = db.define('user_goals', {
	ugId: {
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
	userAcquiredJobSkillsCount: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	totalJobSkillsCount: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	jobProgress: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	userAcquiredRoadmapSkillsCount: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	totalRoadmapSkillsCount: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	roadmapProgress: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	userExperienceInMonths: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	jobExperienceInMonths: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	experienceMatchInPercentage: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	userExpectedSalary: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	jobProvidedSalary: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	salaryMatchInPercentage: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	missingSkills: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	avgTrainingTime: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	locationMatchPercent: {
		type: sequelize.INTEGER,
		allowNull: true,
	},
	isLocalLocation: {
		type: sequelize.BOOLEAN,
		allowNull: true,
	},
	verifiedSkillsCount: {
		type: sequelize.INTEGER,
		allowNull: true,
		defaultValue: 0,
	},
	unverifiedSkillsCount: {
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
});

userGoals.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });
userGoals.belongsTo(goals, { foreignKey: 'goalId', onDelete: 'CASCADE' });

module.exports = userGoals;
