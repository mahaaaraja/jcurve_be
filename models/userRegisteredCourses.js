const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const userRegisteredCourses = db.define("user_registered_courses", {
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
    scormCloudCourseId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    scormCloudRegistrationId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    courseProgress: {
        type: sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    isCourseCompleted: {
        type: sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = userRegisteredCourses;
