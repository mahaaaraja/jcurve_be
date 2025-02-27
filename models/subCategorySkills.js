const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const subCategories = require('./subCategories')
const skills = require('./skills')

const subCategorySkills = db.define("sub_category_skills", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  subCategoryId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
});

subCategorySkills.belongsTo(subCategories, { foreignKey: "subCategoryId", onDelete: "CASCADE" });
subCategorySkills.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });

module.exports = subCategorySkills;
