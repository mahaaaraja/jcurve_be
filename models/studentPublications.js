const Sequelize = require("sequelize");
const db = require("../util/dbConnection");
const users = require("./users");
const studentPublication = db.define("student_publications", {
    publicationId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    publishingDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    publisher: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    authors: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false,
    },
});
studentPublication.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
module.exports = studentPublication;
