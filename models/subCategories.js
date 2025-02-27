const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const subCategories = db.define("sub_categories", {
  subCategoryId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  subCategoryName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  subCategoryNameSlug: {
    type: sequelize.STRING,
    allowNull: true,
  },
  subCategoryDescription: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  skillsCovered: {
    type: sequelize.JSON,
    allowNull: true,
  },
  keywords: {
    type: sequelize.JSON,
    allowNull: true,
  },
});

module.exports = subCategories;
