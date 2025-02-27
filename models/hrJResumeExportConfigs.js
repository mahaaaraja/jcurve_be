const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const hrManagers = require("./hrManagers");
const users = require("./users");
const { jobs } = require("./jobs");

const hrJResumeExportConfigs = db.define('hr_jresume_export_configs', {
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
  userId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  candidateReferenceId: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  jobRole: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  jobReferenceId: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  generatedDate: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  displayPicture: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  name: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  percentageOfSkillsVerified: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  associatedOrganization: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  stream: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  diversityTags: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  email: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  phoneNumber: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  currentCompensation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  expectedCompensation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  noticePeriod: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  currentLocation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  workMode: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  relocationPreference: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  cumulativeScore: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  verifiedSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  claimedSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  trainingNeeded: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  logisticFit: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  financialFit: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  experienceFit: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  overallSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  technicalSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  appliedTechnicalSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  leadershipSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  professionalSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  interpersonalSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  interviewSkills: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  profileDetails: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  contactInformation: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  compensationDetails: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  locationDetails: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  fitAnalysis: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  matchAnalysis: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  skillGraph: {
    type: sequelize.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
});

hrJResumeExportConfigs.belongsTo(hrManagers, { foreignKey: 'hrId', onDelete: 'CASCADE', });
hrJResumeExportConfigs.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE' });
hrJResumeExportConfigs.belongsTo(jobs, { foreignKey: 'jobId', onDelete: 'CASCADE' });

module.exports = hrJResumeExportConfigs;