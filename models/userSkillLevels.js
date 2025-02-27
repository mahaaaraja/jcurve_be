const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const userSkillLevels = db.define("user_skill_levels", {
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
    skillId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    level: {
        type: sequelize.STRING,
        allowNull: false,
        defaultValue: 'BEGINNER', // BEGINNER, INTERMEDIATE, ADVANCED
    },
    acquiredLevel: {
        type: sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    },
});

module.exports = userSkillLevels;