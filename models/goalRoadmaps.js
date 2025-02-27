const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const goals = require('./goals')
const categories = require('./categories')
const subCategories = require('./subCategories')
const skills = require('./skills')
const courses = require('./courses')

const goalRoadmaps = db.define("goal_road_maps", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  goalId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  categoryId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  subCategoryId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  courseId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
});

goalRoadmaps.belongsTo(goals, { foreignKey: "goalId", onDelete: "CASCADE" });
goalRoadmaps.belongsTo(categories, { foreignKey: "categoryId", onDelete: "CASCADE" });
goalRoadmaps.belongsTo(subCategories, { foreignKey: "subCategoryId", onDelete: "CASCADE" });
goalRoadmaps.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });
goalRoadmaps.belongsTo(courses, { foreignKey: "courseId", onDelete: "CASCADE" });

module.exports = goalRoadmaps;
