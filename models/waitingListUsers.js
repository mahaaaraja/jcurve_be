const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const waitingListUsers = db.define("waiting_list_users", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  fullName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: sequelize.STRING,
    allowNull: true,
  }
});

module.exports = waitingListUsers;