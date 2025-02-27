const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const categories = require('./categories')
const subCategories = require('./subCategories')

const categorySubCategories = db.define("category_sub_categories", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  categoryId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  subCategoryId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
});

categorySubCategories.belongsTo(categories, { foreignKey: "categoryId", onDelete: "CASCADE" });
categorySubCategories.belongsTo(subCategories, { foreignKey: "subCategoryId", onDelete: "CASCADE" });

module.exports = categorySubCategories;
