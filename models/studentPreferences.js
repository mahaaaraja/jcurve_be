const Sequelize = require("sequelize");
const db = require("../util/dbConnection");
const users = require("./users");

const studentPreferences = db.define("student_preferences", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    employmentType: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    location: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    locations: {
        type: Sequelize.JSON,
        allowNull: true,
    },
    currentSalary: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    expectedSalary: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    availability: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    isRelocate: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
    },
    outReach: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: 0,
    },
});

studentPreferences.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE", onUpdate: "CASCADE" });

module.exports = studentPreferences;