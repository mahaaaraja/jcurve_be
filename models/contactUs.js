const { DataTypes } = require('sequelize');
const db = require('../util/dbConnection');

const roles = require('./roles');

const contactUs = db.define('contact_us', {
    enquiryId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phoneNo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    isContacted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

contactUs.belongsTo(roles, { foreignKey: "roleId", onDelete: "CASCADE" })

module.exports = contactUs;
