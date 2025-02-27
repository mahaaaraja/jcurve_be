const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const userAssessments = require("./userAssessments");

const userAssessmentSnapshots = db.define("user_assessment_snapshots", {
  userAssessmentSnapshotId: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userAssessmentId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  snapshotLink: {
    type: sequelize.TEXT,
    allowNull: false,
  },
});

userAssessmentSnapshots.belongsTo(userAssessments, { foreignKey: "userAssessmentId", onDelete: "CASCADE" });

module.exports = userAssessmentSnapshots;