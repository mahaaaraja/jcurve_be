const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const categories = db.define("categories", {
  categoryId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  categoryName: {
    type: sequelize.STRING,
    allowNull: false,
  },
  categoryNameSlug: {
    type: sequelize.STRING,
    allowNull: true,
  },
  description: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  thumbnail: {
    type: sequelize.STRING,
    allowNull: true,
  },

});

module.exports = categories;
