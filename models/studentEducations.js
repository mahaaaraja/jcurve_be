const Sequelize = require("sequelize");
const db = require("../util/dbConnection");
const users = require("./users");
const collegesMasters = require("./collegesMasters");
const qualificationsMasters = require("./qualificationsMasters");
const specializationsMasters = require("./specializationsMasters");

const studentEducation = db.define("student_education_histories", {
    educationId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    collegeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    otherCollegeName: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    qualificationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    otherQualificationName: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    specializationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    otherSpecializationName: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    course: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    courseType: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    startDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
    },
    endDate: {
        type: Sequelize.DATEONLY,
        allowNull: true,
    },
    isCurrent: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
    },
    grade: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    gradingSystem: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});
studentEducation.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
studentEducation.belongsTo(collegesMasters, { foreignKey: "collegeId", onDelete: "CASCADE" });
studentEducation.belongsTo(qualificationsMasters, { foreignKey: "qualificationId", onDelete: "CASCADE" });
studentEducation.belongsTo(specializationsMasters, { foreignKey: "specializationId", onDelete: "CASCADE" });
module.exports = studentEducation;
