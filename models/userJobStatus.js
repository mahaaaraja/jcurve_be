const Sequelize = require('sequelize');
const db = require('../util/dbConnection');
const { jobs } = require('./jobs')
const users = require('./users');
const hrManagers = require("./hrManagers");

const userJobStatus = db.define('user_job_status', {
	jobStatusId: {
		type: Sequelize.INTEGER,
		autoIncrement: true,
		allowNull: false,
		primaryKey: true,
	},
	jobId: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	userId: {
		type: Sequelize.INTEGER,
		allowNull: false,
	},
	isShortlisted: {
		type: Sequelize.BOOLEAN,
		allowNull: true,
		defaultValue: false
	},
	isHired: {
		type: Sequelize.BOOLEAN,
		allowNull: true,
		defaultValue: false
	},
	isRejected: {
		type: Sequelize.BOOLEAN,
		allowNull: true,
		defaultValue: false
	},
	status: {
		type: Sequelize.ENUM('SHORTLISTED', 'IN_REVIEW', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'ON_HOLD'),
		allowNull: true,
		defaultValue: null,
	},
	lastUpdatedBy: {
		type: Sequelize.INTEGER,
		allowNull: true,
		defaultValue: null,
	}
});


userJobStatus.belongsTo(jobs, { foreignKey: "jobId", onDelete: "CASCADE" });
userJobStatus.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
userJobStatus.belongsTo(hrManagers, { foreignKey: "lastUpdatedBy", targetKey: "id", onDelete: "CASCADE" });

module.exports = userJobStatus;