const sequelize = require("sequelize");

const db = require("../util/dbConnection");
const userJobStatus = require("./userJobStatus");
const hrManagers = require("./hrManagers");

// tracks what action was performed on which status for a particular candidate and job

const userJobStatusTracking = db.define("user_job_status_tracking", {
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userJobStatusId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  status: {
    type: sequelize.ENUM('SHORTLISTED', 'IN_REVIEW', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED', 'ON_HOLD'),
    allowNull: false,
  },
  action: {
    type: sequelize.ENUM('ADDED', 'REMOVED'),
    allowNull: false,
    comment: "Tracks whether the user was added to the list or removed from the list",
  },
  hrId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
});

userJobStatusTracking.belongsTo(userJobStatus, { foreignKey: "userJobStatusId", targetKey: "jobStatusId", onDelete: "CASCADE" });
userJobStatusTracking.belongsTo(hrManagers, { foreignKey: "hrId", targetKey: "id", onDelete: "CASCADE" });

module.exports = userJobStatusTracking;