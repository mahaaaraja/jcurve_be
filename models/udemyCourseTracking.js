const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const users = require("./users");
const courses = require("./courses");

const udemyCourseTracking = db.define('udemy_course_tracking', {
  id: {
    type: sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  // user info
  userId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  displayName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  name: {
    type: sequelize.STRING,
    allowNull: true,
  },
  surname: {
    type: sequelize.STRING,
    allowNull: true,
  },
  email: {
    type: sequelize.STRING,
    allowNull: false,
  },
  country: {
    type: sequelize.STRING,
    allowNull: true,
    defaultValue: "IN",
  },
  ipAddress: {
    type: sequelize.STRING,
    allowNull: true,
  },
  url: {
    type: sequelize.STRING,
    allowNull: true,
  },
  coursesPurchased: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: 1,
  },
  // course info
  udemyCourseId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  courseId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  courseName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  reviewCount: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  rating: {
    type: sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  publishedTime: {
    type: sequelize.DATE,
    allowNull: true,
    default: sequelize.NOW,
  },
  contentInfoShort: {
    type: sequelize.STRING,
    allowNull: true,
  },
  googleClientId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  // video info
  videoId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  currentTime: {
    type: sequelize.STRING,
    allowNull: true,
  },
  totalTime: {
    type: sequelize.STRING,
    allowNull: true,
  },

  occupationGroupName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  occupationId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  occupationLocalizedName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  occupationName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  occupationPluralizedLocalizedName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  representativeTopicName: {
    type: sequelize.STRING,
    allowNull: true,
  },
});

udemyCourseTracking.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
udemyCourseTracking.belongsTo(courses, { foreignKey: "courseId", onDelete: "CASCADE" });


module.exports = udemyCourseTracking;