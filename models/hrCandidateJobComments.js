const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const hrManagers = require("./hrManagers");
const users = require("./users");

const hrCandidateJobComments = db.define('hr_candidate_job_comments', {
  commentId: {
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
    allowNull: false,
  },
  comment: {
    type: sequelize.TEXT,
    allowNull: true,
    defaultValue: "",
  },
  isEdited: {
    type: sequelize.BOOLEAN,
    allowNull: true, 
    defaultValue: false,
  },
  // editing comments and conserving old comments
  // isEdited: {
  //   type: sequelize.BOOLEAN,
  //   allowNull: true,
  //   default: false,
  // },
  // prevCommentId: {
  //   type: sequelize.INTEGER,
  //   allowNull: true,
  // },
  // isLatest: {
  //   type: sequelize.BOOLEAN,
  //   allowNull: true,
  //   defaultValue: true,
  // },
});

hrCandidateJobComments.belongsTo(hrManagers, { foreignKey: 'hrId', onDelete: 'CASCADE', });
hrCandidateJobComments.belongsTo(users, { foreignKey: 'userId', onDelete: 'CASCADE', });
// hrCandidateJobComments.belongsTo(jobs, { foreignKey: 'jobId', onDelete: 'CASCADE' });

module.exports = hrCandidateJobComments;