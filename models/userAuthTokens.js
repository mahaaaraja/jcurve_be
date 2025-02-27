const sequelize = require('sequelize');
const db = require('../util/dbConnection');
const users = require('./users');

const userAuthTokens = db.define('user_auth_tokens', {
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
  token: {
    type: sequelize.STRING,
    allowNull: true,
  },
  refreshToken: {
    type: sequelize.STRING,
    allowNull: true,
  },
  sessionToken: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  accessToken: {
    type: sequelize.STRING,
    allowNull: true,
  },
  isRevoked: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: 0,
  },
});

userAuthTokens.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });

module.exports = userAuthTokens;