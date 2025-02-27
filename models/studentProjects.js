const Sequelize = require("sequelize");
const db = require("../util/dbConnection");
const users = require("./users");

const studentProject = db.define("student_projects", {
    projectId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    projectTitle: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});
studentProject.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
module.exports = studentProject;
