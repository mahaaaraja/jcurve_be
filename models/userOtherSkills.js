const sequelize = require('sequelize');
const db = require('../util/dbConnection');

const users = require('./users');

const userSkills = db.define('user_other_skills', {
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
    skillName: {
        type: sequelize.STRING,
        allowNull: false,
    },
    resumeSkillLevel: {
        comment: 'user skill level taken from the resume',
        type: sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    }
});

userSkills.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = userSkills;