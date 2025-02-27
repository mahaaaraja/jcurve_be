const Sequelize = require('sequelize');
const db = require('../util/dbConnection');
const users = require('./users');

const userCertificates = db.define('user_certificates', {
  certificateId: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  courseId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  certificateName: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  issueDate: {
    type: Sequelize.DATEONLY,
    allowNull: true,
  },
  issuedBy: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  certificatePath: {
    type: Sequelize.STRING,
    allowNull: true,
  }
});

userCertificates.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = userCertificates;
