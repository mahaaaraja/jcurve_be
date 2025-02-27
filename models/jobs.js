const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const hrManagers = require("./hrManagers");
const facilityMasters = require("./facilityMasters");

const jobs = db.define('jobs', {
  jobId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  partnerJobId: {
    type: sequelize.STRING,
    allowNull: true,
  },
  partnerCode: {
    type: sequelize.STRING,
    allowNull: true,
  },
  hrId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  jobTitle: {
    type: sequelize.STRING,
    allowNull: false,
  },
  companyName: {
    type: sequelize.STRING,
    allowNull: true,
  },
  companyThumbnail: {
    type: sequelize.STRING,
    allowNull: true,
  },
  description: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  jobBrief: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  industry: {
    type: sequelize.STRING,
    allowNull: true,
  },
  jobLocation: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  modeOfWork: {
    comment: 'Onsite/Hybrid/Remote',
    type: sequelize.ENUM('Onsite', 'Hybrid', 'Remote'),
    allowNull: true,
    defaultValue: 'Onsite'
  },
  employmentType: {
    comment: 'Full Time/Part Time/Contract/Internship',
    type: sequelize.ENUM('Full Time', 'Part Time', 'Contract', 'Internship'),
    allowNull: true,
  },
  jobSeniority: {
    comment: 'Fresher/Experienced/Entry Level/Expert',
    type: sequelize.ENUM('Fresher', 'Experienced', 'Entry Level', 'Expert'),
    allowNull: true,
  },
  minExperienceYears: {
    comment: 'Years',
    type: sequelize.INTEGER,
    allowNull: true,
  },
  minExperienceMonths: {
    comment: 'Months',
    type: sequelize.INTEGER,
    allowNull: true,
  },
  minQualification: {
    comment: 'Post Graduate/Graduate',
    type: sequelize.ENUM('Post Graduate', 'Graduate'),
    allowNull: true,
  },
  salaryFrom: {
    comment: 'Per Anum',
    type: sequelize.FLOAT,
    allowNull: true,
  },
  salaryTo: {
    comment: 'Per Anum',
    type: sequelize.FLOAT,
    allowNull: true,
  },
  salaryAvg: {
    comment: 'Per Anum',
    type: sequelize.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  hiringProcess: {
    type: sequelize.JSON,
    allowNull: true,
  },
  isActive: {
    type: sequelize.BOOLEAN,
    defaultValue: true,
  },
  currencyCode: {
    type: sequelize.STRING,
    allowNull: false,
    defaultValue: "INR"
  },
  startDate: {
    type: sequelize.STRING,
    allowNull: true,
  },
  endDate: {
    type: sequelize.STRING,
    allowNull: true,
  },
  lastDateOfApply: {
    type: sequelize.DATEONLY,
    allowNull: true,
  },
  jobDescriptionPath: {
    type: sequelize.STRING,
    allowNull: true,
  },
  salaryCategory: {
    comment: 'Fixed/Negotiable/Performance Based/Unpaid',
    type: sequelize.ENUM('Fixed', 'Negotiable', 'Performance Based', 'Unpaid'),
    allowNull: true,
  },
  numberOfOpenings: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  jobBenchmark: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  jobTagline: {
    type: sequelize.TEXT,
    allowNull: true,
  },
  jobTags: {
    type: sequelize.JSON,
    allowNull: true,
  },
  companiesHiring: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  globalPositions: {
    type: sequelize.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  // Internship Specific
  jobDuration: { // for internships and contact based roles
    comment: 'Months',
    type: sequelize.INTEGER,
    allowNull: true
  },
  otherSkills: {
    type: sequelize.JSON,
    allowNull: true,
  },
  responsibilities: {
    type: sequelize.JSON,
    allowNull: true
  },
  additionalPreferences: {
    type: sequelize.JSON,
    allowNull: true
  },
  jobRanking: {
    comment: 'For order of jobs list. Will be based on company.',
    type: sequelize.INTEGER,
    allowNull: true,
  },
});

const jobFacilities = db.define('job_facilities', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  facilityId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  otherFacilityName: {
    type: sequelize.TEXT,
    allowNull: true
  }
});

const jobResponsibilities = db.define('job_responsibilities', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  responsibility: {
    type: sequelize.TEXT,
    allowNull: false,
  }
});

const jobQualifications = db.define('job_qualifications', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  qualification: {
    type: sequelize.TEXT,
    allowNull: false,
  }
});

const jobFaqs = db.define('job_faqs', {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  jobId: {
    type: sequelize.INTEGER,
    allowNull: false,
  },
  question: {
    type: sequelize.TEXT,
    allowNull: false,
  },
  answer: {
    type: sequelize.TEXT,
    allowNull: false,
  }
});

// jobs.belongsTo(hrManagers, { foreignKey: "hrManagerId", onDelete: "CASCADE" });
jobFacilities.belongsTo(facilityMasters, { foreignKey: "facilityId", onDelete: "CASCADE" });

module.exports = { jobs, jobFacilities, jobResponsibilities, jobQualifications, jobFaqs };