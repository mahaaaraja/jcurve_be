const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const users = require('./users');
const partners = require('./partners');

const userPartnerCodes = db.define("user_partner_codes", {
  userPartnerCodeId: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  partnerCode: {
    type: sequelize.STRING,
    allowNull: false,
  }
});

module.exports = userPartnerCodes;

userPartnerCodes.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
userPartnerCodes.belongsTo(partners, { foreignKey: "partnerCode", targetKey: "partnerCode", onDelete: "CASCADE" });
