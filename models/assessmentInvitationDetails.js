const sequelize = require('sequelize');
const db = require('../util/dbConnection');

// storing all the data received from testlify assessment api
const assessmentInvitationDetails = db.define('assessment_invitation_details', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  testlifyId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  orgId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  userId: {
    comment: 'Testlify User ID',
    type: sequelize.STRING,
    allowNull: true,
  },
  assessmentId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  assessmentCandidateId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  email: {
    type: sequelize.STRING,
    allowNull: true,
  },
  shortId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  inviteKey: {
    type: sequelize.STRING,
    allowNull: true,
  },
  inviteLink: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  isExpired: {
    type: sequelize.BOOLEAN,
    allowNull: true,
  },
  lastModifiedBy: {
    type: sequelize.STRING,
    allowNull: true,
  },
  isPublic: {
    type: sequelize.BOOLEAN,
    allowNull: true,
  },
  type: {
    type: sequelize.STRING,
    allowNull: true,
  },
  invitationLinkValidityStartDate: {
    type: sequelize.DATE,
    allowNull: true,
  },
  invitationLinkValidityEndDate: {
    type: sequelize.DATE,
    allowNull: true,
  },
  source: {
    type: sequelize.STRING,
    allowNull: true,
  },
  isPreview: {
    type: sequelize.BOOLEAN,
    allowNull: true,
  },
  created: {
    type: sequelize.DATE,
    allowNull: true,
  },
  modified: {
    type: sequelize.DATE,
    allowNull: true,
  },
  deleted: {
    type: sequelize.STRING,
    allowNull: true,
  },
});

module.exports = assessmentInvitationDetails;
