const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const users = require("./users");

const recruiterRegistrations = db.define("recruiter_registrations", {
  recruiterId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  // userId: { // TODO remove
  //   type: sequelize.INTEGER,
  //   allowNull: false,
  // },
  officialEmail: {
    type: sequelize.STRING,
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
  countryCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  mobileNumber: {
    type: sequelize.STRING,
    allowNull: true,
  },
  organizationName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  organizationDescription: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  organizationCity: {
    type: sequelize.STRING,
    allowNull: true,
  },
  industry: {
    type: sequelize.STRING,
    allowNull: true,
  },
  employeesCount: {
    type: sequelize.STRING,
    allowNull: true,
  },
  organizationLogo: {
    type: sequelize.STRING,
    allowNull: true,
  },
  isIndependentEmployer: {
    type: sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: 0
  },
});

// recruiterRegistrations.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });

module.exports = recruiterRegistrations;
