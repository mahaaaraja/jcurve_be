const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const partners = db.define("partners", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  partnerName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  partnerCode: { // C001P01 (COMPANY & PROGRAM)
    type: sequelize.STRING,
    allowNull: false,
  },
  partnerLogo: {
    type: sequelize.STRING,
    allowNull: false,
  },
  partnerColorCode: { // for changing website & app theme
    type: sequelize.STRING,
    allowNull: true,
  },
  portalUrl: {
    type: sequelize.STRING,
    allowNull: false,
  }
}, {
  indexes: [
    {
      name: 'unique_idx',
      unique: true,
      fields: ['partnerCode']
    }
  ]
});

module.exports = partners;