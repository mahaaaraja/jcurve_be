const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const roles = db.define("roles", {
  roleId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  roleName: {
    type: sequelize.STRING,
    allowNull: false,
  }
});

module.exports = roles;
