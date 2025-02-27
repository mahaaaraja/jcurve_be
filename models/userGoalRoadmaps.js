const sequelize = require('sequelize');
const db = require('../util/dbConnection');

const users = require('./users');
const goals = require('./goals');
const categories = require('./categories');
const subCategories = require('./subCategories');
const skills = require('./skills');
const courses = require('./courses');

const userGoalRoadmaps = db.define('user_goal_road_maps', {
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

userGoalRoadmaps.belongsTo(users, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
userGoalRoadmaps.belongsTo(goals, {
  foreignKey: 'goalId',
  onDelete: 'CASCADE',
});
userGoalRoadmaps.belongsTo(categories, {
  foreignKey: 'categoryId',
  onDelete: 'CASCADE',
});
userGoalRoadmaps.belongsTo(subCategories, {
  foreignKey: 'subCategoryId',
  onDelete: 'CASCADE',
});
userGoalRoadmaps.belongsTo(skills, {
  foreignKey: 'skillId',
  onDelete: 'CASCADE',
});
userGoalRoadmaps.belongsTo(courses, {
  foreignKey: 'courseId',
  onDelete: 'CASCADE',
});

module.exports = userGoalRoadmaps;
