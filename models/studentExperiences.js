const Sequelize = require("sequelize");
const db = require("../util/dbConnection");
const users = require("./users");
const studentExperience = db.define("student_experiences", {
    experienceId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    jobTitle: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    companyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    otherCompanyName: {
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
    responsibilities: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    isCurrent: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
    },
    location: {
        type: Sequelize.TEXT,
        allowNull: true,
      },   
    country: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    city: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    state: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    employmentType: {
        type: Sequelize.STRING,
        allowNull: true,
    }
});
studentExperience.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
module.exports = studentExperience;
