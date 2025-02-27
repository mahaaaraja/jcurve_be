const sequelize = require("sequelize");

const db = require("../util/dbConnection");
const skills = require("./skills");
const hrManagers = require("./hrManagers")

const assessmentSkillConfig = db.define('assessment_skill_config', {
  id: {
    type: sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  hrId: { // last edited by
    type: sequelize.INTEGER,
    allowNull: false,
  },
  goalId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: null,
  },
  skillId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  totalQuestions: {
    type: sequelize.INTEGER,
    defaultValue: 4,
  },
  totalTime: {
    type: sequelize.INTEGER,
    defaultValue: 4,
  },
  partnerCode: {
    type: sequelize.STRING,
    allowNull: true,
    defaultValue: null,
  },
});

assessmentSkillConfig.belongsTo(skills, { foreignKey: "skillId", onDelete: "CASCADE" });
assessmentSkillConfig.belongsTo(hrManagers, { foreignKey: "hrId", onDelete: "CASCADE" });

module.exports = assessmentSkillConfig;