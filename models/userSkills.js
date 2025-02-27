const sequelize = require('sequelize');
const db = require('../util/dbConnection');

const users = require('./users');
const skills = require('./skills');

const userSkills = db.define('user_skills', {
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
    acquiredLevel: {
        type: sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    },
    resumeSkillLevel: {
        comment: 'user skill level taken from the resume',
        type: sequelize.INTEGER,
        allowNull: true,
        defaultValue: null
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['userId', 'skillId']
        }
    ]
});

userSkills.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });
userSkills.belongsTo(skills, { foreignKey: 'skillId', onDelete: 'CASCADE' });

module.exports = userSkills;