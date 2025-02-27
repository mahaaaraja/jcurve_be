const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const skills = require('./skills')
const courses = require('./courses')

// skills covered in a course
const courseSkills = db.define("course_skills", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  courseId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  skillCode: {
    type: sequelize.STRING,
    allowNull: false,
  },
  courseSkillLevel: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
});

courseSkills.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });
courseSkills.belongsTo(courses, { foreignKey: "courseId", onDelete: "CASCADE" });

module.exports = courseSkills;
