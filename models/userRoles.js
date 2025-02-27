const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const roles = require("./roles");
const users = require("./users");

const userRoles = db.define("user_roles", {
  userRoleId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  roleId: {
    type: sequelize.INTEGER,
    allowNull: false,
  }
});

userRoles.belongsTo(roles, { foreignKey: "roleId", onDelete: "CASCADE" });
userRoles.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });

module.exports = userRoles;
