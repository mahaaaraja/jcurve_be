const sequelize = require('sequelize');

const db = require("../util/dbConnection");
const verifyMailTokens = db.define('verify_mail_tokens', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    email: {
        type: sequelize.STRING,
        allowNull: false
    },
    token: {
        type: sequelize.STRING,
        allowNull: true
    },
    isVerified: {
        type: sequelize.BOOLEAN,
        defaultValue: false
    }
})

module.exports = verifyMailTokens