const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const courses = require("./courses");

const userCourseProgress = db.define('user_course_progress', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  courseId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  vendorCourseId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  vendor: {
    type: sequelize.STRING,
    allowNull: true,
  },
  watchTimeInSec: {
    type: sequelize.BIGINT,  //BIGINT
    allowNull: true,
  },
  totalTimeInSec: {
    type: sequelize.BIGINT,  //BIGINT
    allowNull: true,
  },
  videoCompleted: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  totalVideos: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  courseProgressPercent: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  isCourseCompleted: {
    type: sequelize.BOOLEAN,
    defaultValue: false
  }
});

userCourseProgress.belongsTo(courses, { foreignKey: "courseId", onDelete: "CASCADE" });

module.exports = userCourseProgress;
