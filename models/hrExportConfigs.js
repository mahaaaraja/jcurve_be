const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const hrManagers = require("./hrManagers");

const hrExportConfigs = db.define('hr_export_configs', {
  hrExportConfigId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  hrId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  fullName: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  contactInformation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  currentJobTitle: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  currentJobLocation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  expectedSalary: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  currentSalary: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  availability: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  earliestStartDate: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  experienceInYears: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  coreSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  isCareerGapOneYear: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  preferedLocation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  isRelocate: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  outReach: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  unifiedUnverifiedSkillMatchPercent: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  unifiedVerifiedSkillMatchPercent: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  avgTrainingTime: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  lastWorkingCompany: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  currentJobEndDate: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  jcurveResume: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  userResume: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  // sections
  basicCandidateInformation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  comprehensiveAndAvailability: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  jobFitAndRoleSuitability: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  personalAndWorkPreferance: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  others: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  resume: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

hrExportConfigs.belongsTo(hrManagers, { foreignKey: 'hrId', onDelete: 'CASCADE', });

module.exports = hrExportConfigs;