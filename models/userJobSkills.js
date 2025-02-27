const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const userJobSkills = db.define("user_job_skills", {
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
    jobId: {
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
            fields: ['userId', 'jobId', 'skillId']
        }
    ]
});

module.exports = userJobSkills;