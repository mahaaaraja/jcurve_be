const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const users = require("./users");
const { defaultMaxListeners } = require("nodemailer/lib/xoauth2");
const specializationsMasters = require("./specializationsMasters");
// const colleges = require('./colleges')

const students = db.define("students", {
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
  collegeRollNumber: {
    type: sequelize.STRING,
    allowNull: true,
  },
  firstName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  lastName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  dob: {
    type: sequelize.DATEONLY,
    allowNull: true,
  },
  // collegeId: {
  //   type: sequelize.INTEGER,
  //   allowNull: true,
  // },
  // collegeName: {
  //   type: sequelize.STRING,
  //   allowNull: true,
  // },
  resumeFilePath: {
    type: sequelize.STRING,
    allowNull: true,
  },    
  // nationality: {
  //   type: sequelize.STRING,
  //   allowNull: true,
  // },
  // pronouns: {
  //   type: sequelize.ENUM('He/Him', 'She/Her', 'They/Them', 'Other'),
  //   allowNull: true,
  // },
  gender: {
    type: sequelize.ENUM('Male', 'Female', 'Other.'),
    allowNull: true,
  },
  linkedInUrl: {
    type: sequelize.STRING,
    allowNull: true,
  },
  // githubUrl: {
  //   type: sequelize.STRING,
  //   allowNull: true,
  // },
  // personalWebsiteUrl: {
  //   type: sequelize.STRING,
  //   allowNull: true,
  // },
  // ethnicDiversity: {
  //   type: sequelize.ENUM('Caucasian', 'African American', 'Asian', 'Hispanic', 'Other'),
  //   allowNull: true,
  // },
  // disabilityInclusion: {
  //   type: sequelize.ENUM('Yes', 'No'),
  //   allowNull: true,
  // },
  // neurodiversity: {
  //   type: sequelize.ENUM('Yes', 'No'),
  //   allowNull: true,
  // },
  // veteranStatus: {
  //   type: sequelize.ENUM('Veteran', 'Non-Veteran'),
  //   allowNull: true,
  // },
  address: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  alternateAddress: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  city: {
    type: sequelize.STRING,
    allowNull: true,
  },
  state: {
    type: sequelize.STRING,
    allowNull: true,
  },
  country: {
    type: sequelize.STRING,
    allowNull: true,
  },
  postalCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  // qualificationId: {
  //   type: sequelize.STRING,
  //   allowNull: true,
  // },
  // employmentType: {
  //   type: sequelize.STRING,
  //   allowNull: true,
  // },
  // workExperience: {
  //   type: sequelize.INTEGER,
  //   allowNull: true,
  // },
  // careerGap: {
  //   type: sequelize.INTEGER,
  //   allowNull: true,
  // },
  // specializationId: {
  //   type: sequelize.STRING,
  //   allowNull: true,
  // },
  totalBacklogs: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  activeBacklogs: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  tenthPercentage: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  tenthCgpa: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  tenthMarksheet: {
    type: sequelize.STRING,
    allowNull: true,
  },
  twelfthPercentage: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  twelfthCgpa: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  twelfthMarksheet: {
    type: sequelize.STRING,
    allowNull: true,
  },
  ugPercentage: {
    type: sequelize.FLOAT,
    allowNull: true,
  },
  ugCgpa: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  ugMarksheet: {
    type: sequelize.STRING,
    allowNull: true,
  },
  careerGap: {
    type: sequelize.BOOLEAN,
    allowNull: true,
  }
});

students.belongsTo(users, { foreignKey: "userId", onDelete: "CASCADE" });
// students.belongsTo(colleges, { foreignKey: 'collegeId', onDelete: 'CASCADE' })

module.exports = students;
