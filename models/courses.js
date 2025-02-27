const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const courses = db.define("courses", {
  courseId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  courseName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  courseNameSlug: {
    type: sequelize.STRING,
    allowNull: true,
  },
  courseType: {
    type: sequelize.STRING,
    allowNull: false,
  },
  courseDescription: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  isThirdParty: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  link: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  thumbnail: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  vendor: {
    type: sequelize.STRING,
    allowNull: true,
  },
  duration: {
    type: sequelize.STRING,
    allowNull: true,
  },
  hours: {
    type: sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  courseAccessType: {
    type: sequelize.STRING,
    allowNull: true,
  },
  price: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  level: {
    type: sequelize.STRING,
    allowNull: true,
  },
  keywords: {
    type: sequelize.JSON,
    allowNull: true,
  },
  vendorCourseId: {
    type: sequelize.INTEGER,
    allowNull: true
  },
  vendorCourseNameSlug: {
    type: sequelize.STRING,
    allowNull: true
  },
  isComingSoon: {
    type: sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  hasProjectWork: {
    type: sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  hasAssessmentTest: {
    type: sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  hasAssessmentProject: {
    type: sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = courses;