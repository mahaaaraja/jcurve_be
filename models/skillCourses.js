const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const skills = require('./skills')
const courses = require('./courses')

const skillCourses = db.define("skill_courses", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  courseId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
});

skillCourses.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });
skillCourses.belongsTo(courses, { foreignKey: "courseId", onDelete: "CASCADE" });

module.exports = skillCourses;
