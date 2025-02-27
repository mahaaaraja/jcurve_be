const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const users = require("./users");

const hrManagers = db.define("hr_managers", {
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
  firstName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  lastName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  companyName: {
    type: sequelize.STRING,
    // allowNull: false,
  },
  companyUrl: {
    type: sequelize.STRING,
    // allowNull: false,
  },
  companyLogo: {
    type: sequelize.STRING,
    allowNull: true,
  },
});

hrManagers.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });

module.exports = hrManagers;
