const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const courses = require("./courses")

const courseAssessmentLinks = db.define("course_assessment_links", {
  courseAssessmentLinkId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  courseId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  assessmentLink: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  assessmentDuration: {
    type: sequelize.STRING,
    allowNull: true,
  },
  typeOfQuestion: {
    type: sequelize.STRING,
    allowNull: true,
  }
});

courseAssessmentLinks.belongsTo(courses, { foreignKey: "courseId", onDelete: "CASCADE" });

module.exports = courseAssessmentLinks;