const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const facilityMasters = db.define('facility_masters', {
  facilityId: {
    type: sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  facilityName: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  isActive: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: true
  },
  employmentType: {
    comment: 'Job/Internship',
    type: sequelize.ENUM('Job', 'Internship'),
    allowNull: true,
  } // if the employment type param is left empty, the facility shall be visible in both jobs and internships
});

module.exports = facilityMasters;