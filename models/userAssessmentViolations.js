const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const userAssessments = require("./userAssessments");

const userAssessmentViolations = db.define("user_assessment_violations", {
  userAssessmentViolationId: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userAssessmentId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  eventName: {
    type: sequelize.ENUM('IP_VIOLATION', 'FULL_SCREEN_VIOLATION', 'TAB_CHANGE_VIOLATION', 'COPY_PASTE_VIOLATION', 'MOUSE_OUT_VIOLATION'),
    allowNull: false,
  },
  timestamp: {
    type: sequelize.DATE,
    allowNull: false,
    defaultValue: sequelize.NOW,
  },
});

userAssessmentViolations.belongsTo(userAssessments, { foreignKey: "userAssessmentId", onDelete: "CASCADE" });

module.exports = userAssessmentViolations;