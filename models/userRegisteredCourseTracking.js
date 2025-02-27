const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const userRegisteredCourseTracking = db.define("user_registered_course_tracking", {
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
    materialId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    lessonId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    lessonName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    topicId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    topicName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    watchedDurationInSec: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    videoLengthInSec: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    isCompleted: {
        type: sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = userRegisteredCourseTracking;
