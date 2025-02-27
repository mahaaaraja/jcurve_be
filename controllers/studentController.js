const users = require('../models/users.js');
const students = require('../models/students.js');

const roles = require('../models/roles.js');
const userRoles = require('../models/userRoles.js');
const userPartnerCodes = require('../models/userPartnerCodes.js');

const studentEducations = require('../models/studentEducations.js');
const studentExperiences = require('../models/studentExperiences.js');
const studentPublications = require('../models/studentPublications.js');
const studentProjects = require('../models/studentProjects.js');
const userCertificates = require('../models/userCertificates.js');

const categories = require('../models/categories.js');
const subCategories = require('../models/subCategories.js');
const skills = require('../models/skills.js');
const courses = require('../models/courses.js');

const categorySubCategories = require('../models/categorySubCategories.js');
const subCategorySkills = require('../models/subCategorySkills.js');
const skillCourses = require('../models/skillCourses.js');
const courseSkills = require('../models/courseSkills.js');

const goals = require('../models/goals.js');
const goalRoadmaps = require('../models/goalRoadmaps.js');
const userGoals = require('../models/userGoals.js');
const userSkills = require('../models/userSkills.js');
const userOtherSkills = require('../models/userOtherSkills.js');
const userCourseProgress = require('../models/userCourseProgress.js');
const udemyCourseTracking = require("../models/udemyCourseTracking.js");

const { quizQuestions, courseQuiz, quizTrack, questionTrack } = require('../models/quiz');
const { jobs, jobFacilities, jobResponsibilities, jobQualifications, jobFaqs } = require('../models/jobs.js');
const jobSkills = require('../models/jobSkills');
const jobAssessments = require('../models/jobAssessments.js');
const jobGoals = require('../models/jobGoals.js');

const companiesMasters = require('../models/companiesMasters.js');
const userJobSkills = require('../models/userJobSkills.js');
const courseAssessmentLinks = require('../models/courseAssessmentLinks.js');

const assessments = require('../models/assessments.js');
const assessmentInvitationDetails = require('../models/assessmentInvitationDetails.js');
const assessmentWebhookDetails = require('../models/assessmentWebhookDetails.js');
const userAssessments = require('../models/userAssessments.js');
const userAssessmentSubCategoryWiseResults = require('../models/userAssessmentSubCategoryWiseResults.js');
const userRegisteredCourses = require('../models/userRegisteredCourses.js');
const userRegisteredCourseTracking = require('../models/userRegisteredCourseTracking.js');
const xapiDatasets = require('../models/xapiDatasets.js');
const payments = require('../models/payments.js');
const partners = require('../models/partners.js');
const qualificationsMasters = require('../models/qualificationsMasters.js');
const specializationsMasters = require('../models/specializationsMasters.js');
const userJobMetrics = require("../models/userJobMetrics.js");

const orderDetails = require('../models/orderDetails.js');

const collegesMasters = require('../models/collegesMasters.js');
const userDreamJobs = require('../models/userDreamJobs.js');
const resumeExtractions = require('../models/resumeExtractions.js');

const sequelize = require('../util/dbConnection');
const sendMailer = require('../util/nodeMailer');
const fetchSkillsFromResume = require('../util/fetchSkillsFromResume.js');

const { Op, Sequelize, where } = require('sequelize');
const { getJson } = require('serpapi');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { PDFDocument, rgb } = require('pdf-lib');
const moment = require('moment');
const studentPreferences = require('../models/studentPreferences.js');
const hrController = require('./hrController.js');
const userJcurveResumes = require('../models/userJcurveResumes.js');
const userAssessmentViolations = require('../models/userAssessmentViolations.js');
const userAssessmentSnapshots = require('../models/userAssessmentSnapshots.js');
const questions = require('../models/questions.js');
const userAssessmentQuestions = require('../models/userAssessmentsQuestions.js');
const { updatePartnerJobMetrics, updatePartnerOverallMetrics } = require('./hrController.js');
const userSkillLevels = require('../models/userSkillLevels.js');
const userAssessmentSkillWiseResults = require('../models/userAssessmentSkillWiseResults.js');
moment.tz.setDefault('Asia/Calcutta');

const roadMapColorCodes = [
  {
    textColor: '#5A7EB3',
    backgroundColor: '#F3F8FF',
  },
  {
    textColor: '#8D72BD',
    backgroundColor: '#F4EEFF',
  },
  {
    textColor: '#AFAB57',
    backgroundColor: '#F9F7CF',
  },
  {
    textColor: '#87AA5C',
    backgroundColor: '#E7F0DC',
  },
  {
    textColor: '#AA805F',
    backgroundColor: '#F7EEE7',
  },
  {
    textColor: '#ED7979',
    backgroundColor: '#FFEFEF',
  },
  {
    textColor: '#DB3750',
    backgroundColor: ' #DB37508F',
  },
];

const generateUniqueId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//* profile picture
exports.getProfilePicture = async (req, res) => {
  try {
    const userData = await users.findOne({ where: { userId: req.userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const data = await students.findOne({ where: { userId: req.userId } });
    if (!data) {
      return res.status(404).json({ status: false, message: 'student not found' });
    }

    const profile = userData.dataValues;
    const student = data.dataValues;
    let formattedData = {
      userId: profile.userId,
      firstName: student.firstName,
      lastName: student.lastName,
      profilePicture: profile.profilePicture ? process.env.API_HOST_URL + 'profile_pictures/profilePic_portrait-young-handsome-man-jacket-holding-laptop (1).jpg461727085973944_.jpg' : null,
      jcurveCredits: profile.jcurveCredits
    };

    return res.status(200).json({ status: true, data: formattedData });
  } catch (error) {
    console.error('Unable to get profile', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.setProfilePicture = async (req, res, next) => {
  try {
    const userData = await users.findOne({ where: { userId: req.userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    if (!req.files || !req.files.profilePicture) {
      return res
        .status(404)
        .json({ status: false, data: 'Profile Picture is required' });
    }

    if (userData.profilePicture) {
      const prevFilePath = 'resources' + userData.profilePicture;
      fs.unlink(prevFilePath, function (err) {
        if (err) return console.error(err);
      });
    }

    const fullPath = req.files.profilePicture[0].path;
    const relativePath = path.relative('resources', fullPath);
    const profileImgPath = '/' + relativePath.replace(/\\/g, '/');

    await users.update(
      {
        profilePicture: profileImgPath,
      },
      { where: { userId: userData.userId } },
    );

    res.status(200).json({ status: true, message: 'Profile Picture uploaded Successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error getting while uploading Profile Picture.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteProfilePicture = async (req, res, next) => {
  try {
    const userData = await users.findOne({ where: { userId: req.userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    if (userData.profilePicture) {
      const prevFilePath = 'resources' + userData.profilePicture;
      fs.unlink(prevFilePath, function (err) {
        if (err) return console.error(err);
      });
    } else {
      return res
        .status(404)
        .json({ status: false, message: 'Profile Picture not found' });
    }

    await users.update({ profilePicture: null }, { 
      where: { 
        userId: userData.userId 
      }, 
    });

    res.status(200).json({ status: true, message: 'Profile Picture deleted successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while deleting profile picture.', error);
    res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

//* contact information
exports.getContactInformation = async (req, res) => {
  try {
    const data = await students.findOne({ where: { userId: req.userId } });
    if (!data) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const userData = await users.findOne({ where: { userId: req.userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const profile = data.dataValues;

    let formattedData = {
      collegeRollNumber: profile.collegeRollNumber,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: userData.email,
      countryCode: userData.countryCode,
      phoneNumber: userData.phoneNumber,
      gender: profile.gender,
      addressLine1: profile.address,
      addressLine2: profile.alternateAddress,
      city: profile.city,
      state: profile.state,
      country: profile.country,
      postalCode: profile.postalCode,
    };

    return res.status(200).json({
      status: true,
      data: formattedData,
    });
  } catch (error) {
    console.error('Unable to get Contact information', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.contactInformation = async (req, res, next) => {
  try {
    const { collegeRollNumber, firstName, lastName, email, countryCode, phoneNumber, dateOfBirth, gender, addressLine1, addressLine2, city, postalCode, country, state, linkedInUrl } = req.body;

    const userData = await users.findOne({ where: { userId: req.userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    let insertData = { collegeRollNumber, firstName, lastName, dateOfBirth, gender, address: addressLine1, alternateAddress: addressLine2, city, postalCode, country, state, linkedInUrl };

    if (linkedInUrl) {
      const linkedInRegex = /^(https?:\/\/)?([a-z]{2,3}\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/;
      let isLinkedInUrl = linkedInRegex.test(linkedInUrl);
      if (!isLinkedInUrl) {
        return res.status(422).json({ status: false, message: 'Please provide a valid URL for the LinkedIn URL.' });
      }
      insertData.linkedInUrl = linkedInUrl;
    }

    if (userData.countryCode && userData.phoneNumber && (userData.countryCode != countryCode ||
      userData.phoneNumber != phoneNumber)) {
      return res.status(409).json({ status: false, message: "Phone number can't be changed." });
    }

    if (userData.countryCode == null && userData.phoneNumber == null) {
      const userAccountExists = await users.findOne({ where: { countryCode, phoneNumber } });
      if (userAccountExists) {
        return res.status(409).json({ status: false, message: 'User account exists with provided phone number.' });
      }
      userData.update(
        { countryCode, phoneNumber },
        { where: { userId: req.userId } },
      );
    }

    if (userData.email && userData.email != email) {
      return res.status(409).json({ status: false, message: "Email can't be changed." });
    }

    if (userData.email == null) {
      const userAccountExists = await users.findOne({ where: { email } });
      if (userAccountExists) {
        return res.status(409).json({ status: false, message: 'User account exists with provided email.' });
      }
      userData.update({ email }, { where: { userId: req.userId } });
    }

    const studentData = await students.findOne({ where: { userId: req.userId } });

    if (!studentData) {
      await students.create(insertData);
    }

    await students.update(insertData, { where: { id: studentData.id } });

    res.status(200).json({ status: true, message: 'Contact Information updated Successfully.' });

    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while setting contactInformation.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//* work history
exports.getUserWorkHistory = async (req, res) => {
  try {
    let query = `select *, cm.companyName as companyName, cm.companyWebsite as companyWebsite from student_experiences se left join companies_masters cm on cm.companyId = se.companyId where se.userId = ${req.userId}`;
    const experiences = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    return res.status(200).json({ status: true, data: experiences });
  } catch (error) {
    console.error('Unable to get Work history', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.workHistory = async (req, res, next) => {
  try {
    const { jobTitle, companyId, otherCompanyName, employmentType, location, isCurrent, startDate, endDate, responsibilities } = req.body;
    if (!isCurrent && !endDate) {
      return res.status(404).json({ status: false, message: 'End date is mandatory when isCurrent is false' });
    }

    if (endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(404).json({ status: false, message: 'Invalid: Start date is not before end date.' });
    }

    const companyExists = await companiesMasters.findOne({ where: { companyId } });
    if (!companyExists) {
      return res.status(422).json({ status: false, message: 'Invalid company. Please check.' });
    }

    if (companyExists.companyName == 'Others' && !otherCompanyName) {
      return res.status(422).json({ status: false, message: 'Please provide a valid otherCompanyName.' });
    }

    let experienceData = {
      userId: req.userId,
      jobTitle,
      companyId,
      otherCompanyName: companyExists.companyName == 'Others' ? otherCompanyName : null,
      startDate,
      endDate,
      isCurrent,
      location,
      employmentType,
      responsibilities,
    };

    await studentExperiences.create(experienceData);

    res.status(200).json({ status: true, message: 'workHistory created Successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while setting workHistory.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserWorkHistory = async (req, res, next) => {
  try {
    const { experienceId, jobTitle, companyId, otherCompanyName, employmentType, location, isCurrent, startDate, endDate, responsibilities } = req.body;

    const existingExperience = await studentExperiences.findOne({
      where: { userId: req.userId, experienceId }
    });

    if (!existingExperience) {
      return res.status(404).json({ status: false, message: 'Experience ID does not exist.' });
    }

    if ((startDate && endDate && new Date(startDate) > new Date(endDate)) ||
      (!endDate && endDate != null && startDate && existingExperience.endDate && new Date(startDate) > new Date(existingExperience.endDate)) || (!startDate && endDate && existingExperience.startDate && new Date(existingExperience.startDate) > new Date(endDate))) {
      return res.status(404).json({ status: false, message: 'Invalid: Start date is not before end date.' });
    }

    let experienceData = {};
    if (jobTitle) {
      experienceData.jobTitle = jobTitle;
    }

    if (companyId && existingExperience.companyId != companyId) {
      const companyExists = await companiesMasters.findOne({ where: { companyId } });
      if (!companyExists) {
        return res.status(422).json({ status: false, message: 'Invalid companyId. Please check.' });
      }
      if (companyExists.companyName == 'Others' && !otherCompanyName) {
        return res.status(422).json({ status: false, message: 'Please provide a valid otherCompanyName.' });
      }
      experienceData.companyId = companyId;
      experienceData.otherCompanyName = companyExists.companyName == 'Others' ? otherCompanyName : null;
    } else if (otherCompanyName) {
      // const companyExists = await companiesMasters.findOne({ where: { companyId: existingExperience.companyId } });
      if (!existingExperience.otherCompanyName) {
        return res.status(422).json({ status: false, message: 'otherCompanyName can only be updated if companyType is Others.' });
      }
      experienceData.otherCompanyName = otherCompanyName;
    }

    if (employmentType) {
      experienceData.employmentType = employmentType;
    }
    if (location) {
      experienceData.location = location;
    }
    if (isCurrent != undefined) {
      experienceData.isCurrent = isCurrent;
    }
    if (startDate) {
      experienceData.startDate = startDate;
    }
    if (endDate !== undefined) {
      experienceData.endDate = endDate;
    }
    if (responsibilities) {
      experienceData.responsibilities = responsibilities;
    }

    if (Object.keys(experienceData).length == 0) {
      return res.status(404).json({ status: false, message: 'Invalid Data' });
    }

    await studentExperiences.update(experienceData, {
      where: { experienceId },
    });
    
    res.status(200).json({ status: true, message: 'Work History updated successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while setting workHistory.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteWorkHistory = async (req, res, next) => {
  try {
    const { experienceId } = req.params;

    let studentExperienceExist = await studentExperiences.findOne({
      where: { experienceId, userId: req.userId },
    });
    if (!studentExperienceExist) {
      return res.status(404).json({
        status: false,
        message: 'Student Experience not found.',
      });
    }

    await studentExperiences.destroy({
      where: {
        experienceId
      },
    });

    res.status(200).json({ status: true, data: `Work history deleted successfully` });

    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while deleting WorkHistory.', error);
    res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.updateEligibilityCriteria = async (req, res, next) => {
  try {
    const {
      totalBacklogs = null,
      activeBacklogs = null,
      tenthPercentage = null,
      tenthCgpa = null,
      twelfthPercentage = null,
      twelfthCgpa = null,
      ugPercentage = null,
      ugCgpa = null,
    } = req.body;

    const userData = await users.findOne({ where: { userId: req.userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const studentData = await students.findOne({
      where: { userId: req.userId },
    });
    if (!studentData) {
      return res
        .status(404)
        .json({ status: false, message: 'Student data not found' });
    }

    const deleteFileFunc = (filePath) => {
      const prevFilePath = 'resources' + filePath;
      fs.unlink(prevFilePath, function (err) {
        if (err) return console.error(err);
      });
    };

    const validatePositiveNumber = (value, fieldName) => {
      if (value != null && value != 'null') {
        value = Number(value);
      }
      if (!(value == null || value == 'null') && (isNaN(value) || value < 0)) {
        return res
          .status(422)
          .json({
            status: false,
            message: `${fieldName} must be a positive number.`,
          });
      }
    };

    let validationError =
      validatePositiveNumber(totalBacklogs, 'Total Backlogs') ||
      validatePositiveNumber(activeBacklogs, 'Active Backlogs') ||
      validatePositiveNumber(tenthPercentage, 'Tenth Percentage') ||
      validatePositiveNumber(tenthCgpa, 'Tenth CGPA') ||
      validatePositiveNumber(twelfthPercentage, 'Twelfth Percentage') ||
      validatePositiveNumber(twelfthCgpa, 'Twelfth CGPA') ||
      validatePositiveNumber(ugPercentage, 'UG Percentage') ||
      validatePositiveNumber(ugCgpa, 'UG CGPA');

    if (validationError) {
      return validationError;
    }

    let marksheetPaths = {};
    if (req.files) {
      if (req.files.tenthMarksheet) {
        if (studentData.tenthMarksheet) {
          deleteFileFunc(studentData.tenthMarksheet);
        }
        marksheetPaths.tenthMarksheet =
          '/' +
          path
            .relative('resources', req.files.tenthMarksheet[0].path)
            .replace(/\\/g, '/');
      }
      if (req.files.twelfthMarksheet) {
        if (studentData.twelfthMarksheet) {
          deleteFileFunc(studentData.twelfthMarksheet);
        }
        marksheetPaths.twelfthMarksheet =
          '/' +
          path
            .relative('resources', req.files.twelfthMarksheet[0].path)
            .replace(/\\/g, '/');
      }
      if (req.files.ugMarksheet) {
        if (studentData.ugMarksheet) {
          deleteFileFunc(studentData.ugMarksheet);
        }
        marksheetPaths.ugMarksheet =
          '/' +
          path
            .relative('resources', req.files.ugMarksheet[0].path)
            .replace(/\\/g, '/');
      }
    }

    let eligibilityCriteriaData = {};

    if (totalBacklogs != null && totalBacklogs != 'null') {
      eligibilityCriteriaData.totalBacklogs = totalBacklogs;
    }
    if (activeBacklogs != null && activeBacklogs != 'null') {
      eligibilityCriteriaData.activeBacklogs = activeBacklogs;
    }
    if (tenthPercentage != null && tenthPercentage != 'null') {
      eligibilityCriteriaData.tenthPercentage = tenthPercentage;
    }
    if (tenthCgpa != null && tenthCgpa != 'null') {
      eligibilityCriteriaData.tenthCgpa = tenthCgpa;
    }
    if (twelfthPercentage != null && twelfthPercentage != 'null') {
      eligibilityCriteriaData.twelfthPercentage = twelfthPercentage;
    }
    if (twelfthCgpa != null && twelfthCgpa != 'null') {
      eligibilityCriteriaData.twelfthCgpa = twelfthCgpa;
    }
    if (ugPercentage != null && ugPercentage != 'null') {
      eligibilityCriteriaData.ugPercentage = ugPercentage;
    }
    if (ugCgpa != null && ugCgpa != 'null') {
      eligibilityCriteriaData.ugCgpa = ugCgpa;
    }

    if (marksheetPaths.tenthMarksheet) {
      eligibilityCriteriaData.tenthMarksheet = marksheetPaths.tenthMarksheet;
    }
    if (marksheetPaths.twelfthMarksheet) {
      eligibilityCriteriaData.twelfthMarksheet =
        marksheetPaths.twelfthMarksheet;
    }
    if (marksheetPaths.ugMarksheet) {
      eligibilityCriteriaData.ugMarksheet = marksheetPaths.ugMarksheet;
    }

    if (Object.keys(eligibilityCriteriaData).length == 0) {
      return res.status(404).json({ status: false, message: 'Invalid Data' });
    }

    await students.update(eligibilityCriteriaData, {
      where: { id: studentData.id },
    });

    
    res.status(200).json({ status: true, message: 'Academic Information updated successfully.', });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while updating academic information:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//* education
exports.getUserEducation = async (req, res) => {
  try {
    const educations = await studentEducations.findAll({
      attributes: [
        'educationId',
        'userId',
        'collegeId',
        'otherCollegeName',
        'qualificationId',
        'otherQualificationName',
        'specializationId',
        'otherSpecializationName',
        // [sequelize.literal('university'), 'schoolName'],
        // [sequelize.literal('degree'), 'educationLevel'],
        // 'specialization',
        'startDate',
        'endDate',
        'isCurrent',
      ],
      include: [
        {
          model: collegesMasters,
          attributes: ['collegeName'],
        },
        {
          model: qualificationsMasters,
          attributes: ['qualification'],
        },
        {
          model: specializationsMasters,
          attributes: ['specialization'],
        },
      ],

      where: { userId: req.userId },
    });

    const formattedEducations = educations.map((education) => ({
      educationId: education.educationId,
      userId: education.userId,
      collegeId: education.collegeId,
      collegeName: education.colleges_master?.collegeName || null,
      otherCollegeName: education.otherCollegeName,
      qualificationId: education.qualificationId,
      qualificationName: education.qualifications_master?.qualification || null,
      otherQualificationName: education.otherQualificationName,
      specializationId: education.specializationId,
      specializationName:
        education.specializations_master?.specialization || null,
      otherSpecializationName: education.otherSpecializationName,
      startDate: education.startDate,
      endDate: education.endDate,
      isCurrent: education.isCurrent,
    }));

    return res.status(200).json({
      status: true,
      data: formattedEducations,
    });
  } catch (error) {
    console.error('Unable to get Work history', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.education = async (req, res, next) => {
  try {
    const {
      collegeId,
      otherCollegeName,
      qualificationId,
      otherQualificationName,
      specializationId,
      otherSpecializationName,
      isCurrent,
      startDate,
      endDate,
    } = req.body;

    if (!isCurrent && !endDate) {
      return res
        .status(404)
        .json({
          status: false,
          message: 'End date is mandatory when isCurrent is false',
        });
    }
    if (endDate && new Date(startDate) > new Date(endDate)) {
      return res
        .status(404)
        .json({
          status: false,
          message: 'Invalid: Start date is not before end date.',
        });
    }

    const collegeData = await collegesMasters.findOne({ where: { collegeId } });
    if (!collegeData) {
      return res
        .status(422)
        .json({ status: false, message: 'Invalid collegeId. Please check.' });
    }

    if (collegeData.collegeName == 'Others' && !otherCollegeName) {
      return res
        .status(422)
        .json({
          status: false,
          message: 'Please provide a valid otherCollegeName.',
        });
    }

    const qualificationData = await qualificationsMasters.findOne({
      where: { qualificationId },
    });
    if (!qualificationData) {
      return res
        .status(422)
        .json({
          status: false,
          message: 'Invalid qualificationId. Please check.',
        });
    }
    if (
      qualificationData.qualification == 'Others' &&
      !otherQualificationName
    ) {
      return res
        .status(422)
        .json({
          status: false,
          message: 'Please provide a valid otherQualificationName.',
        });
    }

    const specializationData = await specializationsMasters.findOne({
      where: { specializationId },
    });
    if (!specializationData) {
      return res
        .status(422)
        .json({
          status: false,
          message: 'Invalid specializationId. Please check.',
        });
    }
    if (specializationData.qualificationId != qualificationId) {
      return res
        .status(422)
        .json({
          status: false,
          message: `Specialization ID ${specializationId} not found in qualification: ${qualificationData.qualification}`,
        });
    }
    if (
      specializationData.specialization == 'Others' &&
      !otherSpecializationName
    ) {
      return res
        .status(422)
        .json({
          status: false,
          message: 'Please provide a valid otherSpecializationName.',
        });
    }

    let educationData = {
      userId: req.userId,
      collegeId: collegeId,
      otherCollegeName:
        collegeData.collegeName == 'Others' ? otherCollegeName : null,
      qualificationId: qualificationId,
      otherQualificationName:
        qualificationData.qualification == 'Others'
          ? otherQualificationName
          : null,
      specializationId: specializationId,
      otherSpecializationName:
        specializationData.specialization == 'Others'
          ? otherSpecializationName
          : null,
      startDate,
      endDate,
      isCurrent,
    };

    await studentEducations.create(educationData);

    res.status(200).json({ status: true, message: 'education created Successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while setting education.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserEducation = async (req, res, next) => {
  try {
    const {
      educationId,
      collegeId,
      otherCollegeName,
      qualificationId,
      otherQualificationName,
      specializationId,
      otherSpecializationName,
      isCurrent,
      startDate,
      endDate,
    } = req.body;
    const existingEducation = await studentEducations.findOne({
      where: { userId: req.userId, educationId },
    });
    if (!existingEducation) {
      return res
        .status(404)
        .json({ status: false, message: 'Education ID does not exist.' });
    }

    if (
      (startDate && endDate && new Date(startDate) > new Date(endDate)) ||
      (!endDate && endDate != null && startDate &&
        existingEducation.endDate &&
        new Date(startDate) > new Date(existingEducation.endDate)) ||
      (!startDate && endDate &&
        existingEducation.startDate &&
        new Date(existingEducation.startDate) > new Date(endDate))
    ) {
      return res
        .status(404)
        .json({
          status: false,
          message: 'Invalid: Start date is not before end date.',
        });
    }

    let educationData = {};
    if (collegeId && existingEducation.collegeId != collegeId) {
      const collegeData = await collegesMasters.findOne({
        where: { collegeId },
      });
      if (!collegeData) {
        return res
          .status(422)
          .json({ status: false, message: 'Invalid collegeId. Please check.' });
      }
      if (collegeData.collegeName == 'Others' && !otherCollegeName) {
        return res
          .status(422)
          .json({
            status: false,
            message: 'Please provide a valid otherCollegeName.',
          });
      }
      educationData.collegeId = collegeId;
      educationData.otherCollegeName =
        collegeData.collegeName == 'Others' ? otherCollegeName : null;
    } else if (otherCollegeName) {
      // const collegeData = await collegesMasters.findOne({ where: { collegeId: existingEducation.collegeId } });
      if (!existingEducation.otherCollegeName) {
        return res
          .status(422)
          .json({
            status: false,
            message:
              'otherCollegeName can only be updated if collegeType is Others.',
          });
      }
      educationData.otherCollegeName = otherCollegeName;
    }

    if (
      qualificationId &&
      existingEducation.qualificationId != qualificationId
    ) {
      if (
        specializationId &&
        existingEducation.specializationId != specializationId
      ) {
        const specializationData = await specializationsMasters.findOne({
          where: { specializationId },
        });
        if (!specializationData) {
          return res
            .status(422)
            .json({
              status: false,
              message: 'Invalid specializationId. Please check.',
            });
        }
        if (specializationData.qualificationId != qualificationId) {
          return res
            .status(422)
            .json({
              status: false,
              message: `Specialization ID ${specializationId} not found in qualificationId: ${qualificationId}`,
            });
        }
        if (
          specializationData.specialization == 'Others' &&
          !otherSpecializationName
        ) {
          return res
            .status(422)
            .json({
              status: false,
              message: 'Please provide a valid otherSpecializationName.',
            });
        }
        educationData.specializationId = specializationId;
        educationData.otherSpecializationName =
          specializationData.specialization == 'Others'
            ? otherSpecializationName
            : null;
      } else {
        return res
          .status(422)
          .json({
            status: false,
            message:
              'specialization must be updated when updating qualificationId.',
          });
      }
      const qualificationData = await qualificationsMasters.findOne({
        where: { qualificationId },
      });
      if (!qualificationData) {
        return res
          .status(422)
          .json({
            status: false,
            message: 'Invalid qualificationId. Please check.',
          });
      }

      if (
        qualificationData.qualification == 'Others' &&
        !otherQualificationName
      ) {
        return res
          .status(422)
          .json({
            status: false,
            message: 'Please provide a valid otherQualificationName.',
          });
      }
      educationData.qualificationId = qualificationId;
      educationData.otherQualificationName =
        qualificationData.otherQualificationName == 'Others'
          ? otherQualificationName
          : null;
    } else if (otherQualificationName) {
      // const qualificationData = await qualificationsMasters.findOne({ where: { qualificationId: existingEducation.qualificationId } });
      if (!existingEducation.otherQualificationName) {
        return res
          .status(422)
          .json({
            status: false,
            message:
              'otherQualificationName can only be updated if qualification Type is Others.',
          });
      }
      educationData.otherQualificationName = otherQualificationName;
    }

    if (
      !qualificationId ||
      existingEducation.qualificationId == qualificationId
    ) {
      if (
        specializationId &&
        existingEducation.specializationId != specializationId
      ) {
        const specializationData = await specializationsMasters.findOne({
          where: { specializationId },
        });
        if (!specializationData) {
          return res
            .status(422)
            .json({
              status: false,
              message: 'Invalid specializationId. Please check.',
            });
        }
        if (
          specializationData.qualificationId !=
          existingEducation.qualificationId
        ) {
          return res
            .status(422)
            .json({
              status: false,
              message: `Specialization ID ${specializationId} not found in qualificationId: ${existingEducation.qualificationId}`,
            });
        }
        if (
          specializationData.specialization == 'Others' &&
          !otherSpecializationName
        ) {
          return res
            .status(422)
            .json({
              status: false,
              message: 'Please provide a valid otherSpecializationName.',
            });
        }
        educationData.specializationId = specializationId;
        educationData.otherSpecializationName =
          specializationData.specialization == 'Others'
            ? otherSpecializationName
            : null;
      } else if (otherSpecializationName) {
        // const specializationData = await specializationsMasters.findOne({ where: { specializationId: existingEducation.specializationId } });
        if (!existingEducation.otherSpecializationName) {
          return res
            .status(422)
            .json({
              status: false,
              message:
                'otherSpecializationName can only be updated if specialization Type is Others.',
            });
        }
        educationData.otherSpecializationName = otherSpecializationName;
      }
    }

    if (isCurrent != undefined) {
      educationData.isCurrent = isCurrent;
    }
    if (startDate) {
      educationData.startDate = startDate;
    }
    if (endDate !== undefined) {
      educationData.endDate = endDate;
    }

    if (Object.keys(educationData).length == 0) {
      return res
        .status(404)
        .json({
          status: false,
          message: 'Please provide new values to update.',
        });
    }

    await studentEducations.update(educationData, { where: { educationId } });
    
    res.status(200).json({ status: true, message: 'Education updated Successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while setting education.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteEducation = async (req, res, next) => {
  try {
    const { educationId } = req.params;

    let studentEducationsExist = await studentEducations.findOne({
      where: { educationId, userId: req.userId },
    });
    if (!studentEducationsExist) {
      return res.status(404).json({
        status: false,
        message: 'Student Education not found.',
      });
    }

    await studentEducations.destroy({
      where: {
        educationId
      },
    });

    res.status(200).json({ status: true, message: `Education history deleted successfully`, });

    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while deleting Education History.', error);
    res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

//* resume
exports.getResumeFile = async (req, res) => {
  try {
    const data = await students.findOne({ where: { userId: req.userId } });
    if (!data) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const profile = data.dataValues;
    let { resumeFilePath } = profile;
    const prefix = 'resumeFile_';
    let resumeFileName;

    if (resumeFilePath) {
      const pathParts = resumeFilePath.split('/');
      const filenameWithPrefix = pathParts[pathParts.length - 1];
      resumeFileName = filenameWithPrefix;

      // if (!filenameWithPrefix.startsWith(prefix)) {
      //   throw new Error('String does not start with the expected prefix.');
      // }
      // let trimmedStr = filenameWithPrefix.slice(prefix.length);
      // const regex = /^(.+?\.(pdf|doc|docx|txt))\d+_.(pdf|doc|docx|txt)$/;
      // const match = trimmedStr.match(regex);

      // if (match && match[1]) {
      //   resumeFileName = match[1];
      // } else {
      //   throw new Error('String does not match the expected format.');
      // }
    }

    let formattedData = {
      studentId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      resumeFileName: resumeFileName ? resumeFileName : null,
      resumeFile: profile.resumeFilePath ? process.env.API_HOST_URL + profile.resumeFilePath : null,
    };

    return res.status(200).json({status: true, data: formattedData,});
  } catch (error) {
    console.error('Unable to get profile', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.setResumeFile = async (req, res, next) => {
  try {
    const studentData = await students.findOne({ where: { userId: req.userId } });

    if (!studentData) {
      return res.status(404).json({ status: false, message: 'Student not found.' });
    }
    if (!req.files || !req.files.resumeFile) {
      return res.status(404).json({ status: false, data: 'Resume file is required.' });
    }

    if (studentData.resumeFilePath) {
      const prevFilePath = 'resources' + studentData.resumeFilePath;
      fs.unlink(prevFilePath, function (err) {
        if (err) return console.error('err', err);
      });
    }

    const fullPath = req.files.resumeFile[0].path;
    const relativePath = path.relative('resources', fullPath);
    const resumeFilePath = '/' + relativePath.replace(/\\/g, '/');

    await students.update(
      {
        resumeFilePath: resumeFilePath,
      },
      { where: { id: studentData.id } },
    );

    res.status(200).json({ status: true, message: 'Resume uploaded successfully.' });

    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error getting while uploading Resume File.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteResumeFile = async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const studentData = await students.findOne({
      where: { id: studentId, userId: req.userId },
    });

    if (!studentData) {
      return res.status(404).json({ status: false, message: 'Student not found.' });
    }

    if(!studentData.resumeFilePath) {
      return res.status(404).json({ status: false, message: 'No resume found for the given student.' });
    }

    if (studentData.resumeFilePath) {
      const prevFilePath = 'resources' + studentData.resumeFilePath;
      fs.unlink(prevFilePath, function (err) {
        if (err) return console.error('err', err);
      });
    }

    await students.update({ resumeFilePath: null }, { where: { id: studentId } });
    
    res.status(200).json({ status: true, message: 'Resume deleted successfully.' });

    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while deleting resumeFile.', error);
    res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

//* skills
exports.getSkillList = async (req, res, next) => {
  try {
    const skillsData = await skills.findAll({
      attributes: ['skillId', 'skillName'],
    });

    let userSkillsList = await userSkills.findAll({
      attributes: ['skillId'],
      where: { userId: req.userId },
    });

    const userSkillIdsArray = userSkillsList.map((skill) => skill.skillId);
    const updatedSkillsData = skillsData.map((skill) => ({
      ...skill.dataValues,
      isSelect: userSkillIdsArray.includes(skill.skillId),
    }));

    return res.status(200).json({ status: true, data: updatedSkillsData });
  } catch (error) {
    console.error('Error occurred while retriving skills.', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.selectedUserSkillList = async (req, res, next) => {
  try {

    let userSkillsList = await userSkills.findAll({
      include: [
        {
          model: skills,
          attributes: ['skillName'],
        },
      ],
      where: {
        userId: req.userId,
        [Op.or]: [
          { acquiredLevel: { [Op.gt]: 0 } },
          { resumeSkillLevel: { [Op.gt]: 0 } },
        ],
      },
    });  

    const formattedUserSkillsList = userSkillsList.map((userSkill) => ({
      userSkillId: userSkill.id,
      userId: userSkill.userId,
      skillId: userSkill.skillId,
      skillName: userSkill.skill?.skillName || null,
      acquiredLevel: userSkill.acquiredLevel,
      resumeSkillLevel: userSkill.resumeSkillLevel,
    }));

    return res.status(200).json({
      status: true, data: formattedUserSkillsList, employersLookingCount: 1245
    });
  } catch (error) {
    console.error('Error occurred while retriving skills.', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.updateUserSkillList = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { userSkillsList } = req.body;


    const userSkillsData = await userSkills.findAll({
      attributes: ['skillId'],
      where: { userId },
    });

    const userSkillIds = userSkillsData.map((skill) => skill.skillId);
    const updatePromises = [];
    let nonExistingIds = [];

    for (let skill of userSkillsList) {
      const { skillId, isSelect } = skill;

      if (isSelect && !userSkillIds.includes(skillId)) {
        const skillExists = await skills.findOne({
          where: { skillId },
        });
        if (skillExists) {
          updatePromises.push(
            userSkills.create({ userId, skillId }),
          );
        } else {
          nonExistingIds.push(skillId);
        }
      } else if (!isSelect && userSkillIds.includes(skillId)) {
        updatePromises.push(
          userSkills.destroy({ where: { userId, skillId } }),
        );
      }
    }

    if (nonExistingIds.length > 0) {
      return res.status(404).json({
        status: false,
        message: `Skill(s) with ID(s) ${nonExistingIds.join(', ')} not found.`,
      });
    }
    await Promise.all(updatePromises);
    
    res.status(200).json({ status: true, message: 'Skill list updated successfully.' });
    
    await this.profileCompletionPercentageFunc(userId);
  } catch (error) {
    console.error('Error occurred while updating skill list.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserSkillLevel = async (req, res, next) => {
  try {
    const userId = req.userId;

    const { skillId, resumeSkillLevel } = req.body;
    
    const skillExists = await skills.findOne({
      where: { skillId },
    });
    
    if (!skillExists) {
      return res.status(404).json({ status: false, message: 'Skill not found.' });
    }

    let userSkillExist = await userSkills.findOne({
      where: { userId, skillId },
    });

    if (!userSkillExist) {
      await userSkills.create({ userId, skillId, resumeSkillLevel })
    } else {
      await userSkills.update({ resumeSkillLevel }, { where: { userId, skillId } });
    }

    res.status(200).json({ status: true, message: 'Skill level updated successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while updating skill level.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserSkillLevels = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { skillsToUpdate } = req.body;

    if (!Array.isArray(skillsToUpdate)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid request body, expected an array of objects.',
      });
    }

    const userSkillsData = await userSkills.findAll({
      attributes: ['skillId'],
      where: { userId },
    });

    const userSkillIds = userSkillsData.map((skill) => skill.skillId);
    const updatePromises = [];
    let nonExistingIds = [];


    for (let skill of skillsToUpdate) {
      const { skillId, resumeSkillLevel } = skill;

      if (!userSkillIds.includes(skillId)) {
        const skillExists = await skills.findOne({
          where: { skillId },
        });
        if (skillExists) {
          updatePromises.push(
            userSkills.create({ userId, skillId, resumeSkillLevel })
          );
        } else {
          nonExistingIds.push(skillId);
        }
      } else {
        updatePromises.push(
          userSkills.update({ resumeSkillLevel }, { where: { userId, skillId } })
        );
      }
    }

    if (nonExistingIds.length > 0) {
      return res.status(404).json({
        status: false,
        message: `Skill(s) with ID(s) ${nonExistingIds.join(', ')} not found.`,
      });
    }

    await Promise.all(updatePromises);
    
    res.status(200).json({ status: true, message: 'Skills levels updated successfully.' });
    
    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while updating skills levels.', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUserSkill = async (req, res, next) => {
  try {
    let userId = req.userId
    const { skillId } = req.params;

    let userSkillExist = await userSkills.findOne({
      where: { skillId, userId: userId },
    });

    if (!userSkillExist) {
      return res.status(404).json({
        status: false,
        message: 'User skill not found.',
      });
    }

    await userSkills.destroy({ where: { skillId, userId } });

    res.status(200).json({ status: true, data: `User Skill deleted successfully` });

    await this.profileCompletionPercentageFunc(req.userId);
  } catch (error) {
    console.error('Error occurred while deleting user skills.', error);
    res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

//* profile completion percentage
exports.profileCompletionPercentageFunc = async (userId) => {
  try {
    let query = `
      SELECT 
        s.*, u.email, u.phoneNumber, u.profilePicture, se.educationId AS educations, sx.experienceId AS experiences
      FROM users u
      JOIN students s ON s.userId = u.userId
      LEFT JOIN student_education_histories se ON se.userId = s.userId
      LEFT JOIN student_experiences sx ON sx.userId = s.userId
      WHERE u.userId = :userId;
    `;
    let profile = await sequelize.query(query, { 
      type: sequelize.QueryTypes.SELECT,
      replacements: {userId},
    });

    if(!profile.length) {
      console.error(`User with userId: ${userId} not found.`);
      return 0;
    }

    profile = profile[0];

    // Fetch skill details
    // profile.skills = await userSkills.findOne({
    //   attributes: ['skillId', 'acquiredLevel'],
    //   where: { userId: userId },
    // });
    // resumeFilePath
    // profilePicture

    const individualFieldsToCheck = [
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'address',
      'city',
      'country',
      'state',
      'postalCode',
    ];

    let totalSections = 5;
    const individualPercent =
      100 / (totalSections * individualFieldsToCheck.length);
    const sectionPercent = 100 / totalSections;
    let totalPercent = 0;

    individualFieldsToCheck.forEach((field) => {
      if (profile[field]) {
        totalPercent += individualPercent;
      }
    });
    const sectionFieldsToCheck = [
      'educations',
      'experiences',
      // 'skills',
      'resumeFilePath',
      'profilePicture',
    ];
    sectionFieldsToCheck.forEach((field) => {
      if (profile[field]) {
        totalPercent += sectionPercent;
      }
    });

    totalPercent = parseFloat(parseFloat(totalPercent).toFixed(2));

    await users.update( { profileCompletionPercent: totalPercent }, {
      where: { 
        userId 
      },
    });

    hrController.updateUserJobMetricFunc(userId);
    return totalPercent;
  } catch (error) {
    console.error('Unable to calculate percentage', error);
  }
};

exports.profileCompletionPercentage = async (req, res, next) => {
  try {
    const userId = req.userId;

    let query = `
      SELECT 
        s.*, u.*
      FROM users u
      LEFT JOIN students s ON s.userId = u.userId
      WHERE u.userId = :userId;
    `;

    let profile = await sequelize.query(query, { 
      type: sequelize.QueryTypes.SELECT,
      replacements: {userId},
    });

    if(!profile.length) {
      return res.status(404).json({status: false, message: "User not found."});
    }

    profile = profile[0];

    let totalPercent = profile.profileCompletionPercent;

    if (!totalPercent) {
      totalPercent = await this.profileCompletionPercentageFunc(userId);
    }
    const data = {
      studentId: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      totalPercent: totalPercent,
    };

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error('Unable to get percentage', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.jcurveSkillsEarned = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    const skillCountsQuery = `
      SELECT 
        (SELECT COUNT(skillId) FROM skills) AS totalSkillsCount,

        (SELECT COUNT(us.id)
        FROM user_skills us
        WHERE us.userId = :userId AND us.acquiredLevel >= 7) AS userAcquiredSkillsCount
    `;

    const skillCountsResult = await sequelize.query(skillCountsQuery, {
      replacements: { userId: userId },
      type: sequelize.QueryTypes.SELECT,
    });

    const {
      totalSkillsCount = 0,
      userAcquiredSkillsCount = 0,
    } = skillCountsResult[0] || {};

    skillCountsResult[0].userAcquiredSkillsPercent = totalSkillsCount ? Math.round((userAcquiredSkillsCount / totalSkillsCount) * 100) : 0;

    res.status(200).json({ status: true, data: skillCountsResult });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: 'Unable to fetch pursuing roadmaps count.' });
  }
};

exports.userRoadmapsProgress = async (req, res, next) => {
  try {
    const userId = req.userId;
    
    const roadmapProgressQuery = `
      SELECT g.goalName, ug.roadmapProgress, ug.userAcquiredRoadmapSkillsCount, ug.totalRoadmapSkillsCount
      FROM user_goals ug
      LEFT JOIN goals g ON ug.goalId = g.goalId
      WHERE ug.userId = :userId
    `;

    let roadmapProgressData = await sequelize.query(roadmapProgressQuery, {
      replacements: { userId: userId },
      type: sequelize.QueryTypes.SELECT,
    });

    const roundToNearestFive = (num) => {
      if (num > 0 && num <= 4) {
        return 5;
      }
      return Math.round(num / 5) * 5;
    };

    roadmapProgressData = roadmapProgressData.map((item) => {
      const roundedProgress = roundToNearestFive(item.roadmapProgress || 0);

      const roadmapProgressImage = process.env.API_HOST_URL + `/jgraph_images/${roundedProgress}.png`
      return {
        ...item,
        roadmapProgressImage,
        insight: "Time to work harder \u{1F4AA}"
      };
    });

    res.status(200).json({ status: true, data: roadmapProgressData });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: 'Unable to fetch User Roadmaps Progress.' });
  }
};

exports.createStudentPreference = async (req, res) => {
  try {
    const userId = req.userId;
    const { employmentType, locations, currentSalary, expectedSalary, availability, isRelocate } = req.body;
    const preference = await studentPreferences.findOne({ where: { userId } });

    if (preference) {
      return res.status(400).json({ status: true, data: 'User preference already Exist.' });
    }

    const studentPreference = await studentPreferences.create({
        userId,
        employmentType,
        locations,
        currentSalary,
        expectedSalary,
        availability,
        isRelocate
    });

    hrController.logisticFitFunc(userId);
    hrController.financialFitFunc(userId)
    res.status(200).json({ status: true, message: "Student preference created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Error creating student preference" });
  }
};

exports.getStudentPreferenceByUserId = async (req, res) => {
  try {
    const userId = req.userId;
    const preference = await studentPreferences.findOne({ where: { userId } });

    if (!preference) {
      return res.status(404).json({ status: false, message: "Student preference not found" });
    }

    res.status(200).json({ status: true, data: preference });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Error fetching student preference" });
  }
};

exports.updateStudentPreference = async (req, res) => {
  try {
    const userId = req.userId;
    const { employmentType, locations, currentSalary, expectedSalary, availability, isRelocate } = req.body;

    const preference = await studentPreferences.findOne({ where: { userId } });
    if (!preference) {
      return res.status(404).json({ status: false, message: "Student preference not found" });
    }

    let preferenceData = {}
    
    if (employmentType) {
      preferenceData.employmentType = employmentType;
    }
    if (locations.length) {
      preferenceData.locations = locations;
    }
    if (currentSalary) {
      preferenceData.currentSalary = currentSalary;
    }
    if (expectedSalary) {
      preferenceData.expectedSalary = expectedSalary;
    }
    if (availability) {
      preferenceData.availability = availability;
    }
    if (isRelocate != undefined) {
      preferenceData.isRelocate = isRelocate;
    }

    if (Object.keys(preferenceData).length == 0) {
      return res.status(404).json({ status: false, message: 'Request body cannot be empty' });
    }

    const updatedPreference = await studentPreferences.update(preferenceData, { where: { userId } });
    hrController.logisticFitFunc(userId);
    hrController.financialFitFunc(userId)

    res.status(200).json({ status: true, message: "The preference has been updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Error updating student preference", error: error.message });
  }
};

exports.deleteStudentPreference = async (req, res) => {
  try {
    const userId = req.userId;
    
    const preference = await studentPreferences.findOne({ where: { userId } });
    if (!preference) {
      return res.status(404).json({ message: "Student preference not found" });
    }
    
    await studentPreferences.destroy({ where: { userId } });
    hrController.logisticFitFunc(userId);
    hrController.financialFitFunc(userId)

    res.status(200).json({ message: "Student preference deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting student preference", error: error.message });
  }
};

// videoMaterial //! TO BE REMOVED
exports.getVideoMaterial = async (req, res, next) => {
  try {
    const { materialId } = req.params;

    const checkIfMaterialExists = await materials.findOne({
      where: { materialId, materialType: 'video' },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });

    if (!checkIfMaterialExists) {
      return res
        .status(400)
        .json({ status: false, data: 'Material does not exist.' });
    }

    return res.status(200).json({ status: true, data: checkIfMaterialExists });
  } catch (error) {
    console.error('Error occurred while retriving videos.', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

// jcurveResumeContactInformation
exports.updatejcurveResumeContactInformation = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, countryCode, phoneNumber, gender, city } = req.body;

    const userData = await users.findOne({ where: { userId } });
    if (!userData) {
      checkAndDeleteFileFunc()
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const data = await students.findOne({ where: { userId: req.userId } });
    if (!data) {
      checkAndDeleteFileFunc()
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const checkAndDeleteFileFunc = () => {
      if (req.files && req.files.profilePicture) {
        const filePath = req.files.profilePicture[0].path
        fs.unlink(filePath, function (err) {
          if (err) return console.error(err);
        });
      }
    }

    let updateUserData = {};
    let updateStudentData = {};

    if (firstName) {
      updateStudentData.firstName = firstName;
    }
    if (lastName) {
      updateStudentData.lastName = lastName;
    }

    if (gender) {
      const validGenders = ["Male", "Female", "Others"];
      if (!validGenders.includes(gender)) {
        checkAndDeleteFileFunc();
        return res.status(400).json({ status: false, message: 'gender type should be either Male, Female or Others.' });
      } else {
        updateStudentData.gender = gender;
      }
    }
    if (city) {
      updateStudentData.city = city;
    }

    if (phoneNumber) {
      if (!countryCode) {
        checkAndDeleteFileFunc();
        return res.status(400).json({ status: false, message: 'Country code is required when phone number is provided.' });
      }

      if (userData.countryCode && userData.phoneNumber && (userData.countryCode != countryCode || userData.phoneNumber != phoneNumber)) {
        checkAndDeleteFileFunc();
        return res.status(409).json({ status: false, message: "Phone number can't be changed." });
      }

      const userPhoneNumberExists = await users.findOne({ where: { phoneNumber, countryCode, userId: { [Op.ne]: userId } } });
      if (userPhoneNumberExists) {
        checkAndDeleteFileFunc();
        return res.status(409).json({ status: false, message: 'User account exists with provided phone number.' });
      }

      updateUserData.phoneNumber = phoneNumber;
      updateUserData.countryCode = countryCode;
    }

    if (req.files && req.files.profilePicture) {
      if (userData.profilePicture) {
        const prevFilePath = 'resources' + userData.profilePicture;
        fs.unlink(prevFilePath, function (err) {
          if (err) return console.error(err);
        });
      }

      const fullPath = req.files.profilePicture[0].path;
      const relativePath = path.relative('resources', fullPath);
      const profileImgPath = '/' + relativePath.replace(/\\/g, '/');
      updateUserData.profilePicture = profileImgPath;
    }

    if (Object.keys(updateStudentData).length == 0 && Object.keys(updateUserData).length == 0) {
      return res.status(400).json({ status: false, message: 'No data provided to update.' });
    }

    if (Object.keys(updateStudentData).length > 0) {
      await students.update(updateStudentData, { where: { userId } });
    }
    
    if (Object.keys(updateUserData).length > 0) {
      await users.update(updateUserData, { where: { userId } });
    }

    res.status(200).json({ status: true, message: 'User profile updated successfully.' });
    
    await this.profileCompletionPercentageFunc(userId);
  } catch (error) {
    console.error('Error occurred while updating user profile.', error);
    res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.getjcurveResumeContactInformation = async (req, res) => {
  try {
    const data = await students.findOne({ where: { userId: req.userId } });
    if (!data) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const userData = await users.findOne({ where: { userId: req.userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const profile = data.dataValues;

    let formattedData = {
      email: userData.email,
      firstName: profile.firstName, 
      lastName: profile.lastName,
      countryCode: userData.countryCode,
      phoneNumber: userData.phoneNumber,
      gender: profile.gender,
      city: profile.city,
      profilePicture: userData.profilePicture ? process.env.API_HOST_URL + userData.profilePicture : null,
    };

    return res.status(200).json({ status: true, data: formattedData });
  } catch (error) {
    console.error('Unable to get Contact information', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};


//* dashboard
exports.getAvailableJobsCount = async (req, res, next) => {
  try {
    const { partnerCode } = req.query;

    let whereCondition = { isActive: true, employmentType: 'Full Time' };
    if (partnerCode) {
      whereCondition.partnerCode = partnerCode;
    }

    const activeJobsCount = await jobs.count({
      where: whereCondition,
    });

    res
      .status(200)
      .json({ status: true, data: { availableJobs: activeJobsCount } });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ status: false, message: 'Unable to fetch jobs count.' });
  }
};

exports.pursuingRoadmapsCount = async (req, res, next) => {
  try {
    const userId = req.userId;
    const partnerCode = req.query.partnerCode?.trim();

    const replacements = { userId };

    let query = `
      SELECT COUNT(ug.ugId) AS pursuingRoadmapsCount
      FROM user_goals ug
      LEFT JOIN goals g
      ON ug.goalId = g.goalId
      WHERE ug.userId = :userId
    `;

    // if (partnerCode) {
    //   query += ` AND g.partnerCode = :partnerCode`;
    //   replacements.partnerCode = partnerCode;
    // }

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res
      .status(200)
      .json({
        status: true,
        data: { pursuingRoadmapsCount: results[0].pursuingRoadmapsCount },
      });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({
        status: false,
        message: 'Unable to fetch pursuing roadmaps count.',
      });
  }
};

exports.assessmentTestReports = async (req, res, next) => {
  try {
    const userId = req.userId;

    const assessmentType = req.query.assessmentType;
    const jobId = req.query.jobId;

    if (assessmentType && assessmentType != 'postRoadmap' && assessmentType != 'preRoadmap') {
      return res.status(400).json({
        status: false,
        message: 'assessmentType should be either postRoadmap or preRoadmap',
      });
    }


    let query = `
      SELECT
        ua.userAssessmentId, 
        ua.jobId, 
        ua.updatedAt, 
        ua.assessmentStatus, 
        ua.assessmentReport, 
        ua.assessmentFeeType, 
        ua.testlifyAssessmentEmail,
        a.assessmentName, 
        j.jobTitle
      FROM user_assessments ua
      JOIN assessments a ON ua.assessmentId = a.assessmentId
      JOIN jobs j ON ua.jobId = j.jobId
      WHERE ua.userId = :userId
      AND ua.assessmentStatus IN ('DISQUALIFIED', 'REJECTED', 'COMPLETED')
    `;

    if (assessmentType) {
      query += ` AND a.type = :assessmentType`;
    }

    if (jobId) {
      query += ` AND ua.jobId = :jobId`;
    }

    query += ` ORDER BY ua.updatedAt DESC`;

    const data = await sequelize.query(query, {
      replacements: {
        userId: userId,
        ...(assessmentType && { assessmentType }),
        ...(jobId && { jobId }),
      },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ status: false, message: 'Unable to fetch assessment reports.' });
  }
};

exports.assessmentReportData = async (req, res, next) => {
	try {
    const userId = req.userId;
    const { jobId, partnerCode } =  req.query;

    const assessmentReportRes = await hrController.assessmentReportDataFunc(userId, { jobId, partnerCode });

    if (!assessmentReportRes.status) {
      return res.status(assessmentReportRes.statusCode).json({ status: assessmentReportRes.status, message: assessmentReportRes.message });
    }
    
    return res.status(assessmentReportRes.statusCode).json({ status: assessmentReportRes.status, data: assessmentReportRes.data });
  } catch (error) {
    console.error("Encountered an error while fetching assessment report data: ", error);
    res.status(500).json({status: false, message: "Internal Server Error."});
  }
};

exports.updateJcurveResume = async (req, res, next) => {
  try {
    const userId = req.userId;
    let { countryCode, phoneNumber, currentLocation, location, gender, firstName, lastName, noticePeriod, currentSalary, expectedSalary, workMode, isRelocate, collegeId, otherCollegeName, specializationId, otherSpecializationName } = req.body;
    
    const userData = await users.findOne({ where: { userId: userId } });
    if (!userData) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const checkAndDeleteFileFunc = () => {
      if (req.files && req.files.profilePicture) {
        const filePath = req.files.profilePicture[0].path
        fs.unlink(filePath, function (err) {
          if (err) return console.error(err);
        });
      }
    }

    let updateStudentData = {};
    let updateUserData = {};
    let preferenceData = {}
    let educationData = {}

    if (firstName) {
      updateStudentData.firstName = firstName;
    }
    if (lastName) {
      updateStudentData.lastName = lastName;
    }
    if (gender) {
      const validGenders = ["Male", "Female", "Others"];
      if (!validGenders.includes(gender)) {
        checkAndDeleteFileFunc()
        return res.status(404).json({ status: false, message: `gender type should be either Male, Female or 'Others'.` });
      } else {
        updateStudentData.gender = gender;
      }
    }
    if (currentLocation) {
      updateStudentData.city = currentLocation;
    }
    if (location) {
      updateStudentData.city = location;
    }

    if (noticePeriod) {
      preferenceData.availability = noticePeriod;
    }
    if (workMode) {
      preferenceData.employmentType = workMode;
    }
    if (currentSalary) {
      currentSalary = Number(currentSalary)
      if (!isNaN(currentSalary) && currentSalary > 0) {
        preferenceData.currentSalary = currentSalary;
      } else {
        checkAndDeleteFileFunc()
        return res.status(404).json({ status: false, message: 'Current salary should be a positive number' });
      }
    }

    if (expectedSalary) {
      expectedSalary = Number(expectedSalary);
      if (!isNaN(expectedSalary) && expectedSalary > 0) {
        preferenceData.expectedSalary = expectedSalary;
      } else {
        checkAndDeleteFileFunc();
        return res.status(400).json({
          status: false,
          message: "Expected salary should be a positive number",
        });
      }
    }
    
    if (isRelocate != undefined) {
      const validBooleanValues = [true, false, "true", "false", 0, 1, '0', '1'];
      if (validBooleanValues.includes(isRelocate)) {
        preferenceData.isRelocate = isRelocate == true || isRelocate == "true" || isRelocate == '1';
      } else {
        checkAndDeleteFileFunc()
        return res.status(404).json({ status: false, message: 'isRelocate must be a boolean value' });
      }
    }

    if (collegeId) {
      collegeId = Number(collegeId);
      if (isNaN(collegeId) || collegeId <= 0) {
        checkAndDeleteFileFunc();
        return res.status(400).json({ status: false, message: "collegeId should be a positive number" });
      }
    }

    if (specializationId) {
      specializationId = Number(specializationId);
      if (isNaN(specializationId) || specializationId <= 0) {
        checkAndDeleteFileFunc();
        return res.status(400).json({ status: false, message: "specializationId should be a positive number" });
      }
    }
    
    let query = `SELECT seh.educationId, seh.userId FROM student_education_histories seh WHERE seh.userId = :userId ORDER BY seh.startDate DESC LIMIT 1`
    const [existingEducation] = await sequelize.query(query, {
      replacements: { userId },
      type: sequelize.QueryTypes.SELECT
    });
		
    if (existingEducation) {
      // college
      if (collegeId && existingEducation.collegeId != collegeId) {
        const collegeData = await collegesMasters.findOne({ where: { collegeId } });
        if (!collegeData) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Invalid collegeId. Please check.' });
        }
        if (collegeData.collegeName == 'Others' && (!otherCollegeName || otherCollegeName == 'null')) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Please provide a valid otherCollegeName.' });
        }
        educationData.collegeId = collegeId;
        educationData.otherCollegeName = collegeData.collegeName == 'Others' ? otherCollegeName : null;
      } else if (otherCollegeName) {
        if (!existingEducation.otherCollegeName) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'otherCollegeName can only be updated if collegeType is Others.' });
        }
        educationData.otherCollegeName = otherCollegeName;
      }

      // specialization
      if (specializationId && existingEducation.specializationId != specializationId) {
        const specializationData = await specializationsMasters.findOne({ where: { specializationId } });
        if (!specializationData) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Invalid specializationId. Please check.' });
        }
        // if (specializationData.qualificationId != existingEducation.qualificationId) {
        //   return res.status(422).json({ status: false, message: `Specialization ID ${specializationId} not found in qualificationId: ${existingEducation.qualificationId}` });
        // }
        if (specializationData.specialization == 'Others' && (!otherSpecializationName || otherSpecializationName == 'null')) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Please provide a valid otherSpecializationName.' });
        }
        educationData.specializationId = specializationId;
        educationData.otherSpecializationName = specializationData.specialization == 'Others' ? otherSpecializationName : null;
      } else if (otherSpecializationName) {
        if (!existingEducation.otherSpecializationName) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'otherSpecializationName can only be updated if specialization Type is Others.' });
        }
        educationData.otherSpecializationName = otherSpecializationName;
      }
    } else {
      if(collegeId) {
        const collegeData = await collegesMasters.findOne({ where: { collegeId } });
        if (!collegeData) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Invalid collegeId. Please check.' });
        }
        if (collegeData.collegeName == 'Others' && !otherCollegeName) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Please provide a valid otherCollegeName.' });
        }
        educationData.collegeId = collegeId;
        educationData.otherCollegeName = collegeData.collegeName == 'Others' ? otherCollegeName : null;
      }

      if (specializationId) {
        const specializationData = await specializationsMasters.findOne({ where: { specializationId } });
        if (!specializationData) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Invalid specializationId. Please check.' });
        }

        if (specializationData.specialization == 'Others' && !otherSpecializationName) {
          checkAndDeleteFileFunc();
          return res.status(422).json({ status: false, message: 'Please provide a valid otherSpecializationName.' });
        }
        educationData.specializationId = specializationId;
        educationData.otherSpecializationName = specializationData.specialization == 'Others' ? otherSpecializationName : null;
      }
    }

    if (phoneNumber) {
      let whereCondition = { phoneNumber };
      if (countryCode) {
        whereCondition.countryCode = countryCode;
      }
      const userPhoneNumberExists = await users.findOne({ where: { ...whereCondition, userId: { [Op.ne]: userData.userId } } });
      if (userPhoneNumberExists) {
        checkAndDeleteFileFunc()
        return res.status(409).json({ status: false, message: 'User account exists with provided phone number.' });
      }
      updateUserData = { ...updateUserData, ...whereCondition }
    }

    if (req.files) {
      if (req.files.profilePicture) {
        if (userData.profilePicture) {
          const prevFilePath = 'resources' + userData.profilePicture;
          fs.unlink(prevFilePath, function (err) {
            if (err) return console.error(err);
          });
        }
    
        const fullPath = req.files.profilePicture[0].path;
        const relativePath = path.relative('resources', fullPath);
        const profileImgPath = '/' + relativePath.replace(/\\/g, '/');

        updateUserData.profilePicture = profileImgPath
      }
    }

    if (Object.keys(educationData).length > 0) {
      if (!existingEducation) {
        await studentEducations.create({ userId, ...educationData });
      } else {
        await studentEducations.update(educationData, { where: { educationId: existingEducation.educationId } });
      }
    }

    if (Object.keys(preferenceData).length > 0) {
      const preference = await studentPreferences.findOne({ where: { userId } });
      if (!preference) {
        await studentPreferences.create({ userId, ...preferenceData });
      } else {
        await studentPreferences.update(preferenceData, { where: { userId } });
      }
    }

    if (Object.keys(updateStudentData).length > 0) {
      const studentData = await students.findOne({ where: { userId: userId } });
      if (!studentData) {
        await students.create({ userId, ...updateStudentData });
      } else {
        await students.update(updateStudentData, { where: { id: studentData.id } });
      }  
    }
    
    if (Object.keys(updateUserData).length > 0) {
      await users.update(updateUserData, { where: { userId: userId } });
    }
    
    res.status(200).json({ status: true, message: 'Jcurve Resume data updated successfully.' });
    
    await this.profileCompletionPercentageFunc(userId);
  } catch (error) {
    console.error('Error occurred while updating Jcurve Resume.', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// setJcurveResumeFile
exports.setJcurveResumeFile = async (req, res, next) => {
  try {
    const userId = req.userId;
    let { jobId } = req.body;

    jobId = parseInt(jobId);

    const checkAndDeleteFileFunc = () => {
      if (req.files && req.files.jcurveResume) {
        const filePath = req.files.jcurveResume[0].path
        fs.unlink(filePath, function (err) {
          if (err) return console.error(err);
        });
      }
    }

    if (!jobId) {
      checkAndDeleteFileFunc()
      return res.status(422).json({ status: false, message: "Job ID is required." })
    }

    let jobData = await jobs.findOne({ where: { jobId } });
    if (!jobData) {
      checkAndDeleteFileFunc()
      return res.status(422).json({ status: false, message: "Job not found. Invalid jobId." })
    }

    if (!req.files || !req.files.jcurveResume) {
      return res.status(404).json({ status: false, data: 'jcurveResume file is required.' });
    }

    const userJcurveResumeData = await userJcurveResumes.findOne({ where: { userId, jobId } });
    
    const fullPath = req.files.jcurveResume[0].path;
    const relativePath = path.relative('resources', fullPath);
    const jcurveResume = '/' + relativePath.replace(/\\/g, '/');

    if (userJcurveResumeData) {
      const prevFilePath = 'resources' + userJcurveResumeData.jcurveResume;
      fs.unlink(prevFilePath, function (err) {
        if (err) return console.error('err', err);
      });
      await userJcurveResumes.update({ jcurveResume: jcurveResume }, { where: { userId, jobId } });
    } else {
      await userJcurveResumes.create({ jcurveResume, userId, jobId })
    }

    return res.status(200).json({ status: true, message: 'jcurveResume uploaded successfully.' });
  } catch (error) {
    console.error('Error getting while uploading jcurveResumeFile.', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCertificateCount = async (req, res, next) => {
  try {
    const userId = req.userId;

    const certificateCount = await userCertificates.count({
      where: {
        userId,
      },
    });

    return res.status(200).json({ status: true,certificateCount, });
  } catch (error) {
    console.error('Unable to fetch certificate count! ', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.getUserAssessmentsDetails = async (req, res, next) => {
  try {
    let userId = req.userId;

    const query = `
      SELECT ua.userAssessmentId, ua.assessmentId, ua.jobId, j.jobTitle, a.assessmentName, a.assessmentCategory, ua.createdAt AS dateAndTime, ua.assessmentStatus, ua.assessmentLink, a.assessmentProvider, a.assessmentFeeType
      FROM user_assessments ua
      JOIN jobs j ON ua.jobId = j.jobId
      JOIN assessments a ON ua.assessmentId = a.assessmentId
      WHERE ua.userId = :userId
      AND ua.assessmentStatus IN ('INVITED', 'ENROLLED', 'IN_PROGRESS');
    `;

    const userAssessmentsDetails = await sequelize.query(query, {
      replacements: { userId: userId },
      type: sequelize.QueryTypes.SELECT,
    });
    return res.status(200).json({ status: true, data: userAssessmentsDetails });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ status: false, message: 'Unable to fetch assessment Details.' });
  }
};

exports.getAssessmentResults = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { userAssessmentId } = req.params;
    const jobAssessment = await userAssessments.findOne({
      where: { userAssessmentId, userId: userId },
    });
    if (!jobAssessment) {
      return res.status(404).json({ status: false, message: 'User Assessment not found.' });
    }

    const assessmentResults = await userAssessmentSubCategoryWiseResults.findAll({
      where: { userAssessmentId },
    });

    const subCategoryIds = assessmentResults.map((result) => result.subCategoryId);

    if (!subCategoryIds.length) {
      return res.status(404).json({ status: false, message: 'Assessment sub categories not found.' });
    }

    const query = `
      SELECT 
        sc.subCategoryId,
        sc.subCategoryName,
        sc.subCategoryDescription,
        c.categoryId,
        c.categoryName
      FROM sub_categories AS sc
      JOIN category_sub_categories AS csc ON sc.subCategoryId = csc.subCategoryId
      JOIN categories AS c ON csc.categoryId = c.categoryId
      WHERE sc.subCategoryId IN (:subCategoryIds);
    `
    const categorySubCategoryData = await sequelize.query(query, {
      replacements: { subCategoryIds },
      type: sequelize.QueryTypes.SELECT,
    });

    const subCategoriesWithLevels = categorySubCategoryData.map((subCategory) => {
      const result = assessmentResults.find((r) => r.subCategoryId == subCategory.subCategoryId);
      const userSkillLevel = result && result.totalQuestions > 0 ? parseFloat(((result.correctQuestions / result.totalQuestions) * 10).toFixed(2)) : 0;

      return {
        subCategoryId: subCategory.subCategoryId,
        subCategoryName: subCategory.subCategoryName,
        subCategoryDescription: subCategory.subCategoryDescription,
        categoryId: subCategory.categoryId,
        categoryName: subCategory.categoryName,
        userSubCategoryLevel: userSkillLevel,
        requiredSubCategoryLevel: 7
      };
    });

    const jobId = jobAssessment.jobId;
    const categoryGroupData = {};
    let requiredJobSubCategoryLevel = 0;
    let acquiredJobSubCategoryLevel = 0;

    subCategoriesWithLevels.forEach(item => {
      const { categoryId, categoryName, requiredSubCategoryLevel, userSubCategoryLevel } = item;

      if (!categoryGroupData[categoryId]) {
        categoryGroupData[categoryId] = {
          categoryId: categoryId,
          categoryName: categoryName,
          totalRequiredCategoryLevel: 0,
          totalUserCategoryLevel: 0,
          subCategoryCount: 0,
          subCategoryData: []
        };
      }

      categoryGroupData[categoryId].totalRequiredCategoryLevel += requiredSubCategoryLevel;
      categoryGroupData[categoryId].totalUserCategoryLevel += userSubCategoryLevel;
      categoryGroupData[categoryId].subCategoryCount += 1;
      categoryGroupData[categoryId].subCategoryData.push({
        subCategoryId: item.subCategoryId,
        subCategoryName: item.subCategoryName,
        subCategoryDescription: item.subCategoryDescription,
        categoryId: item.categoryId,
        usersubCategoryLevel: userSubCategoryLevel,
        requiredsubCategoryLevel: requiredSubCategoryLevel
      });
    });

    const categoryData = Object.values(categoryGroupData).map(({ totalRequiredCategoryLevel, totalUserCategoryLevel, ...category }) => {
      const { subCategoryCount } = category;
      let requiredCategoryAvg = (totalRequiredCategoryLevel / subCategoryCount)
      let acquiredCategoryAvg = (totalUserCategoryLevel / subCategoryCount)
      
      requiredJobSubCategoryLevel += requiredCategoryAvg
      acquiredJobSubCategoryLevel += acquiredCategoryAvg

      return {
        ...category,
        requiredCategoryAvg: requiredCategoryAvg.toFixed(2),
        acquiredCategoryAvg: acquiredCategoryAvg.toFixed(2),
      };
    });

    const result = {
      jobId: jobId,
      requiredJobSubCategoryAvg: 10, // (requiredJobSubCategoryLevel / subCategoryCount).toFixed(2),
      acquiredJobSubCategoryAvg: categoryData.length? (acquiredJobSubCategoryLevel / categoryData.length).toFixed(2) : 0,
      categoryData: categoryData
    };

    return res.json({ status: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: 'Unable to fetch assessment Results.' });
  }
};

exports.getStudentCertificates = async (req, res, next) => {
  try {
    const userId = req.userId;
    const courseId = req.query ? parseInt(req.query.courseId, 10) : null;
    const baseUrl = process.env.API_HOST_URL;
    let sqlQuery = `
      SELECT 
        uc.*, c.courseName AS certificateName,
        CONCAT(:baseUrl, uc.certificatePath) AS certificatePath
      FROM user_certificates uc
      LEFT JOIN courses c ON uc.courseId = c.courseId
      WHERE uc.userId = :userId
    `;

    const replacements = { userId, baseUrl };

    if (courseId) {
      const courseIdExists = await courses.findOne({ where: { courseId } });

      if (!courseIdExists) {
        return res.status(404).json({ success: false, message: 'Course not found!' });
      }

      sqlQuery += ' AND uc.courseId = :courseId';
      replacements.courseId = courseId;
    }

    const userCertificatesData = await sequelize.query(sqlQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({ success: true, userCertificatesData });
  } catch (error) {
    console.error('Error while getting certificates.', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//* explore
exports.trendingJobRolesAndSalaries = async (req, res, next) => {
  try {
    const data = [
      {
        jobTitle: 'Software Developer',
        avgSalaryPerAnnum: 1500000,
        jobVacancyCount: 70,
      },
      {
        jobTitle: 'Software Development Engineer',
        avgSalaryPerAnnum: 3200000,
        jobVacancyCount: 320,
      },
      {
        jobTitle: 'Software Development Engineer',
        avgSalaryPerAnnum: 3200000,
        jobVacancyCount: 550,
      },
      {
        jobTitle: 'Full Stack Developer',
        avgSalaryPerAnnum: 2500000,
        jobVacancyCount: 820,
      },
    ];

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error('Error in getTrendingJobDetails:', error);
    return res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

exports.topHighPayingCompanies = async (req, res, next) => {
  try {
    const data = [
      {
        companyName: 'Amazon',
        location: 'Hyderabad, India',
        country: 'India',
        city: 'Hyderabad',
        companyThumbnail:
          'https://www.hatchwise.com/wp-content/uploads/2022/05/amazon-logo-1024x683.png',
        globalCompanySize: '10,000+',
        industry: 'Internet & Web Services',
        totalSalaries: '44.7T',
        totalJobs: '6.3T',
      },
      {
        companyName: 'Microsoft',
        location: 'Hyderabad, India',
        country: 'India',
        city: 'Hyderabad',
        companyThumbnail:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png',
        globalCompanySize: '10,000+',
        industry: 'Computer Hardware Development',
        totalSalaries: '55.8T',
        totalJobs: '8.5T',
      },
      {
        companyName: 'Oracle',
        location: 'Mumbai, India',
        country: 'India',
        city: 'Mumbai',
        companyThumbnail:
          'https://logos-world.net/wp-content/uploads/2020/09/Oracle-Logo.png',
        globalCompanySize: '10,000+',
        industry: 'Enterprise Software and Network',
        totalSalaries: '50.2T',
        totalJobs: '7.0T',
      },
      {
        companyName: 'Google',
        location: 'Hyderabad, India',
        country: 'India',
        city: 'Hyderabad',
        companyThumbnail:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
        globalCompanySize: '10,000+',
        industry: 'Technology company',
        totalSalaries: '60.0T',
        totalJobs: '10.2T',
      },
      {
        companyName: 'Apple',
        location: 'Hyderabad, India',
        country: 'India',
        city: 'Hyderabad',
        companyThumbnail:
          'https://w7.pngwing.com/pngs/566/77/png-transparent-apple-logo-apple-watch-logo-apple-logo-heart-logo-computer-wallpaper.png',
        globalCompanySize: '10,000+',
        industry: 'Technology company',
        totalSalaries: '65.0T',
        totalJobs: '12.0T',
      },
    ];

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error('Error in highPayingCompaniesData:', error);
    return res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

exports.trendingJobRoles = async (req, res, next) => {
  try {
    const data = [
      {
        companyName: 'Amazon',
        jobRole: 'Software Development Engineer',
        location: 'Hyderabad, India',
        country: 'India',
        city: 'Hyderabad',
        companyThumbnail:
          'https://www.hatchwise.com/wp-content/uploads/2022/05/amazon-logo-1024x683.png',
        reportedSalaries: {
          averageSalary: '16LPA',
          medianSalary: '29LPA',
          salaryRange: '10L - 40LPA',
          salaryRangeFrom: '10L',
          salaryRangeTo: '40LPA',
        },
        jobVacancies: 583,
      },
      {
        companyName: 'Google',
        jobRole: 'Full Stack Developer',
        location: 'Hyderabad, India',
        country: 'India',
        city: 'Hyderabad',
        companyThumbnail:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1200px-Google_2015_logo.svg.png',
        reportedSalaries: {
          averageSalary: '7.35L',
          medianSalary: '10.85L',
          salaryRange: '4.5L - 72L',
          salaryRangeFrom: '4.5L',
          salaryRangeTo: '72L',
        },
        jobVacancies: 180000,
      },
      {
        companyName: 'Microsoft',
        jobRole: 'Business Intelligence Engineer',
        location: 'Hyderabad, India',
        country: 'India',
        city: 'Hyderabad',
        companyThumbnail:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/2048px-Microsoft_logo.svg.png',
        reportedSalaries: {
          averageSalary: '20LPA',
          medianSalary: '28LPA',
          salaryRange: '14L - 40LPA',
          salaryRangeFrom: '14L',
          salaryRangeTo: '40LPA',
        },
        jobVacancies: 583,
      },
    ];

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error('Error in getCompanyJobDetails:', error);
    return res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

exports.studentJobMatchScore = async (req, res, next) => {
  try {
    const userId = req.userId;
    let jobDescription = req.body.jobDescription;
    if (!jobDescription)
      return res.status(404).json({ status: false, message: 'Job Description is required.' });
    jobDescription = jobDescription.toLowerCase();
    let courseNames = await courses.findAll({
      attributes: ['courseName'],
      raw: true,
    });
    courseNames = courseNames.map((course) =>
      course['courseName'].toLowerCase(),
    );
    const occurrences = {};
    courseNames.forEach((courseName) => {
      const escapedCourseName = courseName.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&',
      );
      const regex = new RegExp('\\b' + escapedCourseName + '\\b', 'gi');
      jobDescription.split('\n').forEach((line) => {
        if (line.match(regex)) {
          occurrences[courseName] = 1;
        }
      });
    });
    let userCourseNames = await userCourses.findAll({
      where: { userId },
      include: [
        {
          model: courses,
          attributes: ['courseName'],
        },
      ],
      raw: true,
    });
    userCourseNames = userCourseNames.map((course) =>
      course['course.courseName'].toLowerCase(),
    );
    let matchScore = 0;
    userCourseNames.forEach((courseName) => {
      if (occurrences[courseName]) matchScore = matchScore + 1;
    });
    const percentage = Object.keys(occurrences).length > 0 
    ? ((matchScore / Object.keys(occurrences).length) * 100).toFixed(1) : 0;
    const data = {percentage};
    return res.status(200).json({ status: true, message: 'Match Score is successfully retrieved.', data,});
  } catch (err) {
    console.error('Error occured while fetching match score', err);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

linkedInFetchDataCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const userId = req.userId;
    if (!code || !userId) {
      return res
        .status(400)
        .json({ status: false, message: 'Authentication Failed.' });
    }
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.LINKEDIN_REDIRECTURI_FETCH_DATA,
          client_id: process.env.LINKEDIN_CLIENT_ID.match(/.+/)[0],
          client_secret: process.env.LINKEDIN_CLIENT_SECRET.match(/.+/)[0],
        },
      },
    );
    const linkedinAccessToken = tokenResponse.data.access_token;
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${linkedinAccessToken}`,
        },
      },
    );
    await users.update(
      { email: profileResponse.data.email },
      { where: { userId } },
    );

    // downloading ProfilePicture and saving it in our backend
    const linkedinProfilePictureUrl = profileResponse.data.picture;
    if (linkedinProfilePictureUrl) {
      const fileName = 'profilePic_' + userId + Date.now() + '.jpg';
      const filePath = './resources/profile_pictures/' + fileName;
      const pictureResponse = await axios({
        url: linkedinProfilePictureUrl,
        responseType: 'stream',
      });
      pictureResponse.data
        .pipe(fs.createWriteStream(filePath))
        .on('finish', async () => {
          const relativePath = path.relative('./resources', filePath);
          const profilePicture = '/' + relativePath.replace(/\\/g, '/');
          await users.update({ profilePicture }, { where: { userId } });
        });
    }

    // updating student profile

    const firstName = profileResponse.data.given_name;
    const lastName = profileResponse.data.family_name;
    await students.update({ firstName, lastName }, { where: { userId } });

    //fetching data for response
    const userData = await users.findOne({
      attributes: ['email', 'profilePicture'],
      where: { userId },
    });
    const studentData = await students.findOne({
      attributes: ['firstName', 'lastName'],
      where: { userId },
    });
    const fronted_url = process.env.LINKEDIN_REDIRECTURI_FRONTEND;
    res.redirect(
      `${fronted_url}/login?accessToken=${accessToken}&email=${userData.dataValues.email}&firstName=${studentData.dataValues.firstName}&lastName=${studentData.dataValues.lastName}&profilePicture=${userData.dataValues.profilePicture}`,
    );
  } catch (error) {
    console.error('Error during LinkedIn data fetching ', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.thirdPartyFetchDataCallback = async (req, res, next) => {
  try {
    const party = req.params.party;
    if (party === 'linkedin') {
      linkedInFetchDataCallback(req, res);
    }
  } catch (error) {
    console.error(error);
  }
};

exports.thirdPartyFetchData = async (req, res, next) => {
  try {
    const party = req.params.party;
    const accessToken = req.headers['authorization'].split(' ')[1];
    let scope;
    let authUrl;
    let redirectUri;
    let clientId;
    if (party === 'linkedin') {
      clientId = process.env.LINKEDIN_CLIENT_ID.match(/.+/)[0];
      redirectUri = process.env.LINKEDIN_REDIRECTURI_FETCH_DATA;
      scope = 'openid profile email';
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&state=${accessToken}&client_id=${clientId}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&scope=${encodeURIComponent(scope)}`;
    }
    res.redirect(authUrl);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

//* roadmaps
exports.getRoadmaps = async (req, res, next) => {
  try {
    const { partnerCode } = req.query;
    const topCompanyLimit = 5;

    let query = `
      SELECT
      g.goalId,
      g.goalName AS roadmapTitle,
      g.thumbnail AS roadmapThumbnail,
      COUNT(DISTINCT CASE WHEN j.employmentType = 'Internship' THEN j.jobId END) AS internshipsCount,
      COUNT(DISTINCT CASE WHEN j.employmentType != 'Internship' THEN j.jobId END) jobOpportunitiesCount,
      
      0 AS hackathonsCount,
      COUNT(j.companyName) AS totalEmployers,

      -- Subquery for top companies per goal
      (
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'jobId', topCompanies.jobId,
              'companyThumbnail', topCompanies.companyThumbnail
            )
        )
        FROM (
          SELECT j1.jobId, j1.companyThumbnail
          FROM jobs j1
          JOIN job_goals jg1 ON j1.jobId = jg1.jobId
          WHERE jg1.goalId = g.goalId AND j1.employmentType = 'Full Time' AND j1.isActive = 1
          ${partnerCode ? 'AND j1.partnerCode = :partnerCode' : ''} 
          ORDER BY j1.jobRanking DESC
          LIMIT ${topCompanyLimit}
        ) AS topCompanies
      ) AS topCompanyInfo

      FROM goals g
      LEFT JOIN job_goals jg ON g.goalId = jg.goalId
      LEFT JOIN jobs j ON jg.jobId = j.jobId
      ${partnerCode ? 'AND j.partnerCode = :partnerCode' : ''} 

      WHERE g.isActive = 1 AND j.isActive = 1
      ${partnerCode ? 'AND j.partnerCode = :partnerCode' : ''} 
      GROUP BY g.goalId;
    `;

    const roadmapsData = await sequelize.query(query, {
      replacements: { partnerCode },
      type: sequelize.QueryTypes.SELECT,
    });

    const message = 'Data Sent Successfully.';
    return res.status(200).json({ status: true, message, roadmapsData });
  } catch (error) {
    console.error("Encountered an error while fetching roadmaps: ", error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

const getGoalData = async (goalId, jobId, partnerCode) => {
  let query = `
    SELECT
      ${jobId ? `j.jobId, j.jobTitle AS roadmapTitle, j.companyName, j.companyThumbnail AS roadmapThumbnail` : `g.goalId, g.goalName AS roadmapTitle, g.thumbnail AS roadmapThumbnail`}, j.jobBenchmark, j.jobTagline, j.jobTags, j.companiesHiring, j.globalPositions
    FROM goals g
    JOIN job_goals jg ON jg.goalId = g.goalId 
    JOIN jobs j ON jg.jobId = j.jobId 
    WHERE ${jobId ? `j.jobId = :jobId AND j.isActive = 1 AND` : ``} g.goalId = :goalId ${partnerCode ? ` AND j.partnerCode = :partnerCode` : ``} AND g.isActive = 1
    LIMIT 1;
  `;

  let goalData = await sequelize.query(query, {
    type: Sequelize.QueryTypes.SELECT,
    replacements: {jobId, goalId, partnerCode}
  });

  return goalData[0];
}

// categories list
exports.getRoadmapCategories = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { goalId } = req.params;
    let { jobId, partnerCode } = req.query;

    const goalData = await getGoalData(goalId, jobId, partnerCode);

    if (!goalData?.roadmapTitle) {
      return res.status(404).json({ status: false, message: `No such ${jobId ? `job` : `goal`} found.` });
    }

    let userRoadmapQuery = ``;

    if (!jobId) {
      userRoadmapQuery = `
        SELECT 
          c.categoryId, c.categoryName, c.description AS categoryDescription, 7 as requiredSkillLevel,
          ROUND(AVG(COALESCE(us.acquiredLevel, 0))) AS userSkillLevel,
          ROUND(AVG(COALESCE(us.resumeSkillLevel, 0))) AS userResumeSkillLevel,
          SUM(CASE WHEN COALESCE(us.acquiredLevel, 0) >= 7 THEN 1 ELSE 0 END) AS skillsCompleted,
          CASE WHEN COUNT(CASE WHEN COALESCE(us.acquiredLevel, 0) < 7 THEN 1 END) = 0 THEN TRUE ELSE FALSE END AS isCertified
        FROM goal_road_maps grm
        JOIN categories c ON c.categoryId = grm.categoryId AND grm.goalId = :goalId
        LEFT JOIN user_skills us ON us.skillId = grm.skillId AND us.userId = :userId
        GROUP BY c.categoryId, c.categoryName, c.description
        ORDER BY c.categoryId;
      `;
    } else {
      userRoadmapQuery = `
        SELECT 
          c.categoryId, c.categoryName, c.description AS categoryDescription,
				  ROUND(AVG(COALESCE(js.requiredSkillLevel))) AS requiredSkillLevel,
          ROUND(AVG(COALESCE(us.acquiredLevel, 0))) AS userSkillLevel,
          ROUND(AVG(COALESCE(us.resumeSkillLevel, 0))) AS userResumeSkillLevel,
          CAST(SUM(CASE WHEN COALESCE(us.acquiredLevel, 0) >= js.requiredSkillLevel THEN 1 ELSE 0 END)AS UNSIGNED) AS skillsCompleted,
          CASE WHEN COUNT(CASE WHEN COALESCE(us.acquiredLevel, 0) < js.requiredSkillLevel THEN 1 END) = 0 THEN TRUE ELSE FALSE END AS isCertified
        FROM goal_road_maps grm
        JOIN job_skills js ON js.skillId = grm.skillId
        JOIN categories c ON c.categoryId = grm.categoryId
        LEFT JOIN user_skills us ON us.skillId = grm.skillId AND us.userId = :userId
        WHERE js.jobId = :jobId AND grm.goalId = :goalId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
        GROUP BY c.categoryId, c.categoryName, c.description
        ORDER BY c.categoryId;
      `;
    }

    const roadmapData = await sequelize.query(userRoadmapQuery, {
      replacements: { goalId, jobId, userId },
      type: sequelize.QueryTypes.SELECT,
    });

    const jobMetricsQuery = `
      SELECT 
        COALESCE(SUM(CASE WHEN js.isGoatSkill = true THEN 1 ELSE 0 END), 0) AS goatSkillCount,
        COALESCE(SUM(CASE WHEN js.isIndustrySkill = true THEN 1 ELSE 0 END), 0) AS industrySkillCount,
        COALESCE(SUM(CASE WHEN js.isIdealProfileSkill = true THEN 1 ELSE 0 END), 0) AS idealProfileSkillCount,
        COALESCE(COUNT(CASE WHEN us.acquiredLevel >= 7 THEN 1 ELSE NULL END), 0) AS userSkillsCount
      FROM job_skills js
      JOIN user_skills us ON js.skillId = us.skillId
      WHERE js.jobId = :jobId AND us.userId = :userId;
    `;

    let replacements = {userId};
    
    let skillComparisionGraph;
    if (!jobId) {
      let jobQuery = `
        SELECT jg.jobId, jg.goalId
        FROM job_goals jg
        WHERE jg.goalId = :goalId
      `;

      const jobsData = await sequelize.query(jobQuery, {
        replacements: { goalId: goalId },
        type: sequelize.QueryTypes.SELECT,
      });

      if (jobsData.length) {
        replacements.jobId = jobsData[0].jobId;
        jobId = jobsData[0].jobId;
      }
    }

    if(jobId) {
      replacements.jobId = jobId;
    }

    const jobMetricsData = await sequelize.query(jobMetricsQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    skillComparisionGraph = jobMetricsData[0]

    let certifiedCateogories = 0;

    for (let i = 0; i < roadmapData.length; i++) {
      roadmapData[i]['textColor'] = roadMapColorCodes[i].textColor;
      roadmapData[i]['backgroundColor'] = roadMapColorCodes[i].backgroundColor;
      roadmapData[i].skillsCompleted = +roadmapData[i].skillsCompleted;
      if (roadmapData[i].isCertified) {
        certifiedCateogories++;
      }
      if(roadmapData[i].categoryName === "Technical Skills" || roadmapData[i].categoryName === "Applied Technical Skills") {
        roadmapData[i].companiesHiring = goalData.companiesHiring;
        roadmapData[i].globalPositions = goalData.globalPositions;
      }
    }

    let totalRequiredCertificates = roadmapData.length;


    const userGoalsExist = await userGoals.findOne({
      where: { userId, goalId },
    });
    if (!userGoalsExist) {
      await userGoals.create({ userId, goalId, jobId });
      hrController.updateUserJobMetricFunc(userId);
    }

    const roadmapProgress = await getRoadmapProgress({jobId, goalId, userId});

    return res.status(200).json({
      status: true,
      data: {
        roadmapProgress,
        roadmapData,
        goalData: goalData,
        skillComparisionGraph: skillComparisionGraph,
      },
    });
  } catch (error) {
    console.error("Encountered an error while fetching roadmap categories: ", error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

// sub categories list
exports.getRoadmapSubCategories = async (req, res, next) => {
  try {
    let userId = req.userId;
    let goalId = req.params.goalId;
    let { jobId, partnerCode } = req.query;
    const categoryId = req.params.categoryId;

    const categoryExists = await categories.findOne({ where: { categoryId } });
    if (!categoryExists) {
      return res.status(404).json({ status: false, message: 'Category not found.' });
    }

    const goalData = await getGoalData(goalId, jobId, partnerCode);

    if (!goalData?.roadmapTitle) {
      return res.status(404).json({ status: false, message: `No such ${jobId ? `job` : `goal`} found.` });
    }

    if (jobId) {
      roadmapQuery = `
        SELECT
          s.subCategoryId, s.subCategoryName, s.subCategoryDescription,
				  ROUND(AVG(COALESCE(js.requiredSkillLevel))) AS requiredSkillLevel,
          ROUND(AVG(COALESCE(us.acquiredLevel, 0))) AS userSkillLevel,
          ROUND(AVG(COALESCE(us.resumeSkillLevel, 0))) AS userResumeSkillLevel,
          CAST(SUM(CASE WHEN COALESCE(us.acquiredLevel, 0) >= js.requiredSkillLevel THEN 1 ELSE 0 END)AS UNSIGNED) AS skillsCompleted,
          CASE WHEN COUNT(CASE WHEN COALESCE(us.acquiredLevel, 0) < js.requiredSkillLevel THEN 1 END) = 0 THEN TRUE ELSE FALSE END AS isCertified
        FROM goal_road_maps grm
        LEFT JOIN job_skills js ON grm.skillId = js.skillId
        JOIN sub_categories s ON s.subCategoryId = grm.subCategoryId
        LEFT JOIN user_skills us ON us.skillId = js.skillId AND us.userId = :userId
        WHERE grm.goalId = :goalId AND js.jobId = :jobId AND grm.categoryId = :categoryId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
        GROUP BY s.subCategoryId, s.subCategoryName, s.subCategoryDescription
        ORDER BY s.subCategoryId;
      `;
    } else {
      roadmapQuery = `
        SELECT
          sc.subCategoryId, sc.subCategoryName, sc.subCategoryDescription, 
          7 AS requiredSkillLevel, 
          ROUND(AVG(COALESCE(us.acquiredLevel, 0))) AS userSkillLevel,
          ROUND(AVG(COALESCE(us.resumeSkillLevel, 0))) AS userResumeSkillLevel,
          SUM(CASE WHEN COALESCE(us.acquiredLevel, 0) >= 7 THEN 1 ELSE 0 END) AS skillsCompleted,
          CASE 
            WHEN COUNT(CASE WHEN COALESCE(us.acquiredLevel, 0) < 7 THEN 1 END) = 0 
            THEN TRUE ELSE FALSE 
          END AS isCertified
        FROM goal_road_maps grm
        JOIN sub_categories sc ON grm.subCategoryId = sc.subCategoryId
        LEFT JOIN user_skills us ON us.skillId = grm.skillId AND us.userId = :userId
        WHERE grm.goalId = :goalId AND grm.categoryId = :categoryId
        GROUP BY sc.subCategoryId, sc.subCategoryName, sc.subCategoryDescription
        ORDER BY sc.subCategoryId;
      `;
    }

    let roadmapData = await sequelize.query(roadmapQuery, {
      replacements: { jobId, userId, goalId, categoryId },
      type: sequelize.QueryTypes.SELECT,
    });

    let nextCategoryQuery = `
      SELECT DISTINCT c.categoryId, c.categoryName
      FROM goal_road_maps grm
      JOIN categories c ON grm.categoryId = c.categoryId
      WHERE grm.goalId = :goalId
      AND grm.categoryId > :categoryId
      ORDER BY c.categoryId ASC
      LIMIT 1;
    `;
    const nextCategory = await sequelize.query(nextCategoryQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {goalId, categoryId},
    });

    const roadmapProgress = await getRoadmapProgress({jobId, goalId, userId});

    return res.status(200).json({
      status: true,
      data: {
        textColor: roadMapColorCodes[categoryId - 1].textColor,
        backgroundColor: roadMapColorCodes[categoryId - 1].backgroundColor,
        category: categoryExists.categoryName,
        categoryThumbnail: categoryExists.thumbnail,
        goalData: goalData,
        roadmapData: roadmapData,
        nextCategoryId: nextCategory.length > 0 ? nextCategory[0].categoryId : null,
        nextCategoryName: nextCategory.length > 0 ? nextCategory[0].categoryName : null,
        roadmapProgress,
      },
    });
  } catch (error) {
    console.error("Encountered an error while fetching roadmap categories: ", error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

// skills list
exports.getRoadmapSkills = async (req, res, next) => {
  try {
    const userId = req.userId;
    let {goalId, categoryId, subCategoryId} = req.params;
    let {jobId, partnerCode} = req.query;

    if(!userId) {
      return res.status(401).json({status: false, message: "Please login to continue."});
    }
    
    if(!goalId || !categoryId || !subCategoryId) {
      return res.status(400).json({status: false, message: "Goal ID, Category ID, and Subcategory ID must be provided."});
    }

    const categoryExists = await categories.findOne({
      where: {
        categoryId
      }
    });

    if(!categoryExists) {
      return res.status(404).json({status: false, message: "No such category found."});
    }

    const subCategoryExists = await subCategories.findOne({
      where: {
        subCategoryId
      }
    });

    if(!subCategoryExists) {
      return res.status(404).json({status: false, message: "No such sub category found."});
    }

    const goalData = await getGoalData(goalId, jobId, partnerCode);

    if (!goalData?.roadmapTitle) {
      return res.status(404).json({ status: false, message: `No such ${jobId ? `job` : `goal`} found.` });
    }

    let roadmapQuery = ``;

    if(jobId) {
      roadmapQuery = `
        SELECT 
          s.skillName, grm.skillId, us.acquiredLevel, us.resumeSkillLevel, s.skillDescription,
          COALESCE(js.requiredSkillLevel, 0) AS requiredSkillLevel,
          CASE WHEN js.isGoatSkill = 1 THEN 1 ELSE 0 END AS isMustHave,
          CASE WHEN js.isGoatSkill = 1 THEN 0 ELSE CASE WHEN js.isIndustrySkill = 1 THEN 1 ELSE 0 END END AS isGoodToHave,
          CASE WHEN us.acquiredLevel IS NOT NULL AND COALESCE(js.requiredSkillLevel, 0) <= us.acquiredLevel THEN 1 ELSE CASE WHEN js.isGoatSkill = 1 AND us.resumeSkillLevel IS NOT NULL OR us.acquiredLevel IS NOT NULL THEN 0 ELSE NULL END END AS isVerified,
          CASE WHEN js.isGoatSkill = 1 AND us.acquiredLevel IS NULL AND us.resumeSkillLevel IS NULL THEN 1 ELSE NULL END AS isMissingSkill
        FROM goal_road_maps grm
        JOIN job_skills js ON js.skillId = grm.skillId
        JOIN skills s ON grm.skillId = s.skillId
        LEFT JOIN user_skills us ON us.skillId = s.skillId AND us.userId = :userId
        WHERE js.jobId = :jobId AND grm.categoryId = :categoryId AND grm.subCategoryId = :subCategoryId AND grm.goalId = :goalId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
        GROUP BY js.skillId
        ORDER BY js.skillId;
      `;
    } else {
      roadmapQuery = `
        SELECT 
          s.skillName, grm.skillId, us.acquiredLevel, us.resumeSkillLevel, s.skillDescription,
          7 AS requiredSkillLevel,
          NULL AS isMustHave,
          NULL AS isGoodToHave,
          CASE WHEN us.acquiredLevel >= 7 THEN 1 ELSE CASE WHEN us.resumeSkillLevel IS NOT NULL OR us.acquiredLevel IS NOT NULL THEN 0 ELSE NULL END END AS isVerified,
          NULL AS isMissingSkill
        FROM goal_road_maps grm
        JOIN skills s ON grm.skillId = s.skillId
        LEFT JOIN user_skills us ON us.skillId = s.skillId AND us.userId = :userId
        WHERE grm.goalId = :goalId AND grm.categoryId = :categoryId AND grm.subCategoryId = :subCategoryId
        GROUP BY grm.skillId
        ORDER BY grm.skillId;
      `;
    }

    
    const replacements = {categoryId, subCategoryId, userId};

    if(jobId) {
      replacements.jobId = jobId;
      replacements.goalId = goalId;
    } else {
      replacements.goalId = goalId;
    }

    const skillRoadmapData = await sequelize.query(roadmapQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements
    });

    

    let nextCategoryQuery = `
      SELECT 
        DISTINCT c.categoryId, c.categoryName
      FROM goal_road_maps grm
      JOIN categories c ON grm.categoryId = c.categoryId
      WHERE grm.goalId = :goalId AND grm.categoryId > :categoryId
      ORDER BY c.categoryId ASC
      LIMIT 1;
    `
    const nextCategory = await sequelize.query(nextCategoryQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {goalId, categoryId},
    });

    const roadmapProgress = await getRoadmapProgress({goalId, jobId, userId});

    return res.status(200).json({
      status: true,
      data: {
        textColor: roadMapColorCodes[categoryId - 1].textColor,
        backgroundColor: roadMapColorCodes[categoryId - 1].backgroundColor,
        category: categoryExists.categoryName,
        categoryThumbnail: categoryExists.thumbnail,
        subCategory: subCategoryExists.subCategoryName,
        subCategoryId: subCategoryExists.subCategoryId,
        roadmapData: skillRoadmapData,
        goalData,
        nextSubcategoryId: nextCategory.length ? nextCategory[0].categoryId : null,
        nextSubcategoryName: nextCategory.length ? nextCategory[0].categoryName : null,
        roadmapProgress,
      },
    });
  } catch (error) {
    console.error("Encountered an error while fetching roadmap skills: ", error);
    res.status(500).json({status: false, message: "Internal Server Error."});
  }
};

// course details with free, paid links
exports.getRoadmapCourses = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { goalId, categoryId, subCategoryId, skillId } = req.params;
    const {jobId, partnerCode } = req.query;

    if (!userId) {
      return res.status(404).json({ status: false, message: 'User ID not found.' });
    }

    const goalData = await goals.findOne({ where: { goalId } });
    if (!goalData) {
      return res.status(404).json({ status: false, message: 'Goal not found.' });
    }

    const jobGoal = await jobGoals.findOne({
      where: { goalId },
      include: [{
        model: jobs,
        where: { isActive: true },
        attributes: ['jobId'],
      }],
    });
    
    if (!jobGoal) {
      return res.status(404).json({ status: false, message: 'Active Job Goal not found.' });
    }

    const categoryExists = await categories.findOne({ where: { categoryId } });
    if (!categoryExists) {
      return res.status(404).json({ status: false, message: 'Category not found.' });
    }

    const subCategoryExists = await subCategories.findOne({ where: { subCategoryId } });
    if (!subCategoryExists) {
      return res.status(404).json({ status: false, message: 'Sub Category not found.' });
    }

    let skillInfoQuery = `
      SELECT
        s.*, us.acquiredLevel, us.resumeSkillLevel
      FROM skills s
      LEFT JOIN user_skills us ON us.skillId = s.skillId AND us.userId = :userId
      WHERE s.skillId = :skillId;
    `;

    const skillInfo = await sequelize.query(skillInfoQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {skillId, userId}
    })

    if(!skillInfo.length) {
      return res.status(404).json({status: false, message: "Skill not found."});
    }
    
    let hasCompletedPreAssessment = false;

    const preAssessment = await userAssessments.findOne({
      where: {
        userId,
        jobId: jobGoal.jobId,
        assessmentType: 'preRoadmap',
        assessmentFeeType: 'Paid',
      },
    });
    hasCompletedPreAssessment = preAssessment ? true : false;

    if(jobId) {

      const whereCondition = {jobId, isActive: true};

      if(partnerCode) {
        whereCondition.partnerCode = partnerCode;
      }

      const jobExists = await jobs.findOne({
        where: whereCondition
      });

      if(!jobExists) {
        return res.status(404).json({status: false, message: "No such active job found."});
      }

      const jobSkillExists = await jobSkills.findOne({
        where: {
          jobId, skillId
        }
      });

      if(!jobSkillExists) {
        return res.status(404).json({status: false, message: "No such job skill found."});
      }
    }

    let query = `
      SELECT
        c.*, cs.skillId, o.paymentStatus, ucp.courseProgressPercent, ucp.isCourseCompleted
      FROM courses c
      LEFT JOIN course_skills cs ON cs.courseId = c.courseId
      LEFT JOIN order_details od ON od.courseId = c.courseId AND od.userId = :userId
      LEFT JOIN orders o ON o.orderId = od.orderId
      LEFT JOIN user_course_progress ucp ON ucp.courseId = c.courseId AND ucp.userId = :userId
      WHERE cs.skillId = :skillId 
      GROUP BY c.link 
      ORDER BY CASE WHEN c.vendor = 'Udemy' THEN 1 WHEN c.vendor = 'Simplilearn' THEN 2 ELSE 3 END;
    `;

    const courseData = await sequelize.query(query, {
      replacements: {skillId, userId},
      type: sequelize.QueryTypes.SELECT,
    });

    const freeMaterialsData = [];
    const paidMaterialsData = [];

    let skillJobsQuery = `
      SELECT 
        j.jobId, j.companyThumbnail 
      FROM jobs j
      LEFT JOIN job_skills js ON js.jobId = j.jobId
      LEFT JOIN job_goals jg ON jg.jobId = j.jobId
      WHERE js.skillId = ${skillInfo[0].skillId} AND j.isActive = true AND j.employmentType = "Full Time" AND ${partnerCode ? `j.partnerCode = :partnerCode AND` : ``} jg.goalId = ${goalData.goalId}
      ORDER BY j.jobRanking
    `;

    const replacements = {};

    if(partnerCode) {
      replacements.partnerCode = partnerCode;
    }
    let skillJobs = await sequelize.query(skillJobsQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    for (let i in courseData) {
      
      courseData[i].jobOpportunities = skillJobs;
      if (courseData[i].courseAccessType == "Paid") {
        courseData[i].isPaid = (courseData[i].paymentStatus == "Completed") ? true : false;
        paidMaterialsData.push(courseData[i]);
      } else {
        freeMaterialsData.push(courseData[i]);
      }
    }

    const roadmapProgress = await getRoadmapProgress({jobId, goalId, userId});

    skillInfo[0].beginnerSkillsText = ['Understands basic SQL syntax and data types.', 'Can write simple SELECT, INSERT, UPDATE and DELETE queries.'];
    skillInfo[0].intermediateSkillsText = ['Proficient with JOINs, subqueries, and aggregate functions like COUNT, SUM, and GROUP BY.', 'Understands database schema design and can create or modify tables and indexes.'];
    skillInfo[0].advancedSkillsText = ['Skilled in writing and debugging complex stored procedures, triggers, and views.', 'Experienced in database performance tuning and optimization strategies.'];

    const userSkillAssessment = {
      userVerifiedSkillLevel: skillInfo[0].acquiredLevel ? +skillInfo[0].acquiredLevel : 0,
      userUnverifiedSkillLevel: skillInfo[0].resumeSkillLevel ? +skillInfo[0].resumeSkillLevel : 0,
      beginnerSkillsText: skillInfo[0].beginnerDescription,
      intermediateSkillsText: skillInfo[0].intermediateDescription,
      advancedSkillsText: skillInfo[0].advancedDescription,
    };

    return res.status(200).json({
      status: true,
      data: {
        goalName: goalData.dataValues.goalName,
        categoryName: categoryExists.categoryName,
        categoryId: categoryExists.categoryId,
        subCategoryName: subCategoryExists.subCategoryName,
        subCategoryId: subCategoryExists.subCategoryId,
        skillName: skillInfo[0].skillName,
        skillId: skillInfo[0].skillId,
        hasCompletedPreAssessment,
        freeMaterialsData,
        paidMaterialsData,
        userSkillAssessment,
      }
    });
  } catch (error) {
    console.error("Encountered an error while fetching skill courses: ", error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

const getRoadmapProgress = async (data) => {
  try {
    let { jobId, goalId, userId } = data;

    let {totalSkillsCount = 0, userUnverifiedSkillsCount = 0, userVerifiedSkillsCount = 0, hoursRequiredToLearnMissingSkills = 0, missingSkills = 0, userVerifiedSkillsPercent = 0, userUnverifiedSkillsPercent = 0, roadmapProgressPercentage = 0} = {};

    // const jobIdProvided = jobId ? true : false;
    
    if (!jobId) {
      let jobGoal = await jobGoals.findOne({ where: { goalId } });
      jobId = jobGoal.jobId;

      // let countQuery = `
      //   SELECT
	    //     sd.jobId, 
      //     COUNT(sd.skillId) AS totalSkillsCount,
      //     SUM(IF(sd.resumeSkillLevel >= sd.requiredSkillLevel, 1, 0)) as userUnverifiedSkillsCount,
      //     SUM(IF(sd.acquiredLevel >= sd.requiredSkillLevel, 1, 0)) as userVerifiedSkillsCount,
      //     SUM(CASE WHEN sd.isMissingSkill = 1 THEN 1 ELSE 0 END) AS missingSkills,
      //     ROUND(SUM(
		  //       CASE
      //         WHEN sd.isMissingSkill = 1 AND sd.courseCount > 1 THEN (sd.maxHours + sd.minHours) / 2
      //         WHEN sd.isMissingSkill = 1 AND sd.courseCount = 1 THEN sd.maxHours
      //         ELSE 0
      //       END
      //     )) AS hoursRequiredToLearnMissingSkills
      //   FROM (
	    //     SELECT 
      //       j.jobId, js.skillId, js.requiredSkillLevel, us.acquiredLevel, us.resumeSkillLevel, cd.courseCount, cd.maxHours, cd.minHours,
      //       IF((ua.userId IS NULL AND (COALESCE(us.resumeSkillLevel, 0) < COALESCE(js.requiredSkillLevel, 0))) OR (ua.userId IS NOT NULL AND (COALESCE(us.acquiredLevel, 0) < COALESCE(js.requiredSkillLevel, 0))), 1, 0) AS isMissingSkill
	    //     FROM job_skills js
      //     JOIN jobs j ON j.jobId = js.jobId AND j.isActive = 1
	    //     LEFT JOIN user_skills us ON us.skillId = js.skillId AND us.userId = :userId
	    //     LEFT JOIN user_assessments ua ON ua.userId = :userId AND ua.jobId = js.jobId AND ua.assessmentStatus = "COMPLETED" AND ua.assessmentFeeType = "Sponsored"
	    //     LEFT JOIN (
      //       SELECT
      //         sc.skillId,
      //         COUNT(c.courseId) AS courseCount,
      //         MAX(c.hours) AS maxHours,
      //         MIN(c.hours) AS minHours
      //       FROM skill_courses sc
      //       LEFT JOIN courses c ON sc.courseId = c.courseId
      //       GROUP BY sc.skillId
      //       ) cd ON js.skillId = cd.skillId
	    //     WHERE js.jobId = :jobId AND js.isIndustrySkill = 1 ) AS sd;
      //   `;
      // const roadmapProgressData = await sequelize.query(countQuery, { 
      //   type: sequelize.QueryTypes.SELECT, 
      //   replacements: {jobId, userId},
      // });

      // if(!roadmapProgressData.length) {
      //   return {totalSkillsCount, userUnverifiedSkillsCount, userVerifiedSkillsCount, userVerifiedSkillsPercent, userUnverifiedSkillsPercent, missingSkills, roadmapProgressPercentage, hoursRequiredToLearnMissingSkills};
      // }

      // totalSkillsCount = +roadmapProgressData[0].totalSkillsCount;
      // userUnverifiedSkillsCount = +roadmapProgressData[0].userUnverifiedSkillsCount;
      // userVerifiedSkillsCount = +roadmapProgressData[0].userVerifiedSkillsCount;
      // hoursRequiredToLearnMissingSkills = +roadmapProgressData[0].hoursRequiredToLearnMissingSkills;
      // missingSkills = +roadmapProgressData[0].missingSkills;
      // userVerifiedSkillsPercent = Math.floor((userVerifiedSkillsCount / totalSkillsCount) * 100);
      // userUnverifiedSkillsPercent = Math.floor((userUnverifiedSkillsCount / totalSkillsCount) * 100);

    }
    const userJobData = await userJobMetrics.findOne({
      where: {
        userId, jobId,
      },
    });

    totalSkillsCount = +userJobData.totalJobSkillsCount;
    userUnverifiedSkillsCount = +userJobData.unverifiedSkillsLevelMatchCount;
    userVerifiedSkillsCount = +userJobData.verifiedSkillsLevelMatchCount;
    userVerifiedSkillsPercent = +userJobData.verifiedSkillLevelMatchPercent;
    userUnverifiedSkillsPercent = +userJobData.unverifiedSkillLevelMatchPercent;
    missingSkills = +userJobData.missingSkills;
    hoursRequiredToLearnMissingSkills = +userJobData.avgTrainingTime;
    
    roadmapProgressPercentage = Math.min(Math.floor(userUnverifiedSkillsCount * 100 / totalSkillsCount, 100));

    return {totalSkillsCount, userUnverifiedSkillsCount, userVerifiedSkillsCount, userVerifiedSkillsPercent, userUnverifiedSkillsPercent, missingSkills, roadmapProgressPercentage, hoursRequiredToLearnMissingSkills};
  } catch (error) {
    console.error("Encountered an error while trying to fetch user roadmap progress: ", error);
    throw new Error("Encountered an error while trying to fetch user roadmap progress.")
  }
};

exports.uploadCourseCertificates = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { courseId, certificateName, issueDate, issuedBy } = req.body;
    let insertData = { userId, courseId, issuedBy };

    const courseExists = await courses.findOne({ where: { courseId } });
    if (!courseExists) {
      return res.status(404).json({ status: false, message: 'Course not found.' });
    }

    if (certificateName) {
      insertData.certificateName = certificateName;
    }

    if (!req.files || !req.files.certificateFile) {
      return res.status(404).json({ status: false, data: 'certificateFile is required' });
    }

    const fullPath = req.files.certificateFile[0].path;
    const relativePath = path.relative('resources', fullPath);
    const certificatePath = '/' + relativePath.replace(/\\/g, '/');
    insertData.certificatePath = certificatePath;

    const certificateExists = await userCertificates.findOne({ where: { userId, courseId } });

    if (certificateExists) {
      if (certificateExists.certificatePath) {
        const prevFilePath = 'resources' + certificateExists.certificatePath;
        fs.unlink(prevFilePath, function (err) {
          if (err) return console.error(err);
        });
      }
      // if (issueDate) {
      insertData.issueDate = issueDate;
      // }

      await userCertificates.update(insertData, { where: { certificateId: certificateExists.certificateId } });
      return res.status(200).json({ status: true, message: 'Certificate updated successfully.' });
    } else {
      // if (!issueDate) {
      //   return res.status(404).json({ status: false, data: "issueDate is required" });
      // }

      await userCertificates.create(insertData);
      return res.status(200).json({ status: true, message: 'Certificate uploaded successfully.' });
    }
  } catch (error) {
    console.error('Error getting while uploading certificates.', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

//* YouTube course tracking
exports.getCourseProgress = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { courseId } = req.params;

    const courseExists = await courses.findOne({ where: { courseId } });
    if (!courseExists) {
      return res.status(400).json({ status: false, data: 'Course does not exist.' });
    }

    const courseTrack = await userCourseProgress.findOne({ where: { userId, courseId } });
    if (!courseTrack) {
      return res.status(200).json({ status: true, data: {} });
    }

    return res.status(200).json({
      status: true,
      data: {
        courseId: courseTrack.courseId,
        watchTimeInSec: courseTrack.watchTimeInSec ? courseTrack.watchTimeInSec : 0,
        progress: courseTrack.progress,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.setCourseProgress = async (req, res, next) => {
  try {
    const userId = req.userId;

    const { courseId, isCourseCompleted } = req.body;

    const courseExists = await courses.findOne({ where: { courseId } });

    if (!courseExists) {
      return res.status(400).json({ status: false, data: 'Course does not exist.' });
    }

    const courseTrackExist = await userCourseProgress.findOne({ where: { userId, courseId: courseExists.courseId } });

    if (courseTrackExist) {
      if (courseTrackExist.isCourseCompleted) {
        return res.status(200).json({ status: true, data: 'User already watched this course video.' });
      }
      await userCourseProgress.update({ isCourseCompleted }, { where: { id: courseTrackExist.id } }).then((result) => {
        return res.status(200).json({ status: true, data: { courseId, isCourseCompleted } });
      }).catch((error) => {
        res.status(500).json({ status: false, message: 'Something went wrong. Please try after sometime.' });
      });
    } else {
      const insertData = {
        userId,
        courseId,
        vendor: "YouTube",
        // watchTimeInSec: courseExists.duration? courseExists.duration: 0,
        isCourseCompleted
      };

      await userCourseProgress.create(insertData).then((result) => {
        return res.status(200).json({ status: true, data: { courseId, isCourseCompleted } });
      }).catch((error) => {
        return res.status(500).json({ status: false, message: 'Something went wrong. Please try after sometime.' });
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.setCourseWatchTime = async (req, res, next) => {
  try {
    const userId = req.userId;

    const { courseId, watchTimeInSec } = req.body;

    const courseExists = await courses.findOne({ where: { courseId } });

    if (!courseExists) {
      return res.status(400).json({ status: false, data: 'Course deos not exist.' });
    }

    const courseTrackExist = await userCourseProgress.findOne({ where: { userId, courseId: courseExists.courseId, courseId } });

    if (courseTrackExist) {
      if (courseTrackExist.isCourseCompleted) {
        return res.status(200).json({ status: true, data: 'User already watched this course video.' });
      }
      await userCourseProgress.update({ watchTimeInSec }, { where: { id: courseTrackExist.id } }).then((result) => {
        return res.status(200).json({ status: true, data: { courseId, watchTimeInSec } });
      }).catch((error) => {
        res.status(500).json({ status: false, message: 'Something went wrong. Please try after sometime.' });
      });
    } else {
      const insertData = {
        userId,
        courseId,
        vendor: "YouTube",
        watchTimeInSec: watchTimeInSec,
        // progress: progress
      };

      await userCourseProgress.create(insertData).then((result) => {
        return res.status(200).json({ status: true, data: { courseId, watchTimeInSec } });
      }).catch((error) => {
        return res.status(500).json({ status: false, message: 'Something went wrong. Please try after sometime.' });
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

const createObj = (data) => {
  const filteredData = {};

  for (let key in data) {
    if (data[key] != null) {
      filteredData[key]= data[key];
    }
  }

  return filteredData;
};

//* udemy course tracking
exports.udemyCourseTracking = async (req, res, next) => {
  try {
    const data = req.body;

    const {email, courseId: vendorCourseId} = data;

    if(!email || !vendorCourseId){
      return res.status(400).json({status: false, message: "User Id and Vendor Course Id is required."});
    }

    const vendor = "Udemy";

    const userExists = await users.findOne({where: {email,}});

    if (!userExists) {
      return res.status(404).json({ status: false, message: "User Not Found." });
    }

    const userId = userExists.userId;

    const courseExists = await courses.findOne({
      where: {
        vendorCourseId, vendor
      }
    });

    if (!courseExists) {
      return res.status(404).json({ status: false, message: "No course found." });
    }

    const courseId = courseExists.courseId;

    const userCourseProgressExists = await userCourseProgress.findOne({
      where: {
        userId, courseId: courseExists.courseId,
      }
    });

    const courseProgressPercent = data.courseProgress || userCourseProgressExists.courseProgress || 0;
    const {totalVideos, videoCompleted} = data;

    let isCourseCompleted = 0;

    if (courseProgressPercent === 100 && videoCompleted === totalVideos) {
      isCourseCompleted = 1;
    }

    const userCourseProgressObj = createObj({userId, courseId, vendorCourseId, vendor, videoCompleted, totalVideos, courseProgressPercent, isCourseCompleted});

    if (!userCourseProgressExists) {
      await userCourseProgress.create(userCourseProgressObj);
    } else {
      await userCourseProgress.update(userCourseProgressObj, {
        where: {id: userCourseProgressExists.id,}
      });
    }

    const videoId = data.videoID;

    if(videoId) {
      // destructuring and renaming variables
      const { num_reviews: reviewCount, published_time: publishedTime, content_info_short: contentInfoShort, ip_address: ipAddress, number_of_courses_purchased: coursesPurchased, currentTime, totalTime, display_name: displayName, name, surname, country, url, courseName, rating, googleClientId, occupationGroupName, occupationId, occupationLocalizedName, occupationName, occupationPluralizedLocalizedName, representativeTopicName, courseId: udemyCourseId } = data;

      // creating an object to be used for creating and  updating data
      const trackingData = createObj({ reviewCount, publishedTime, contentInfoShort, ipAddress, coursesPurchased, videoId, currentTime, totalTime, displayName, name, surname, country, url, courseName, rating, googleClientId, occupationGroupName, occupationId, occupationLocalizedName, occupationName, occupationPluralizedLocalizedName, representativeTopicName, email, userId, courseId, udemyCourseId });

      const udemyUserCourseTrackingExists = await udemyCourseTracking.findOne({
        where: {
          udemyCourseId: vendorCourseId, userId, videoId,
        }
      });

      if (!udemyUserCourseTrackingExists) {
        await udemyCourseTracking.create(trackingData);
      } else {
        await udemyCourseTracking.update(trackingData, {
          where: {id: udemyUserCourseTrackingExists.id}
        });
      }
    }

    res.status(200).json({ status: true, message: "User Course Progress Updated Successfully." });
  } catch (error) {
    console.error("Encountered an error while tracking course progress: ", error);
    return res.status(500).json({ status: false, message: "Something went wrong." });
  }
};

//* jobs
exports.getJobs = async (req, res, next) => {
  try {
    const { jobId, partnerCode, employmentType } = req.query;
    let jobQuery = `
    SELECT 
      j.*, datediff(curdate(), date(j.createdAt)) AS postedAt, jg.goalId
    FROM jobs j
    LEFT JOIN job_goals jg ON jg.jobId = j.jobId
    WHERE 1=1`;

    if (jobId) {
      jobQuery += ` AND j.jobId = :jobId`;
    }

    if (partnerCode) {
      jobQuery += ` AND j.partnerCode = :partnerCode`;
    }
    if (employmentType) {
      jobQuery += ` AND j.employmentType = :employmentType`;
    }

    if (!req.isAllJobs) {
      jobQuery += ` AND j.isActive = true`;
      // jobQuery += ` AND j.lastDateOfApply >= "${moment().format('YYYY-MM-DD')}"`;
    }
    let data = await sequelize.query(jobQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {jobId, partnerCode, employmentType}
    });

    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error("Encountered an error while fetching jobs: ", error);
    return res.status(400).json({ status: false, message: 'Unable to fetch jobs.' });
  }
};

exports.getJobDetails = async (req, res, next) => {
  try {
    const userId = req.userId;

    const { partnerCode } = req.query;
    const jobId = +req.params.jobId;
    let goalId = +req.query.goalId;

    const replacements = { jobId };
    let jobQuery = `
      SELECT j.*, datediff(curdate(), date(j.createdAt)) AS postedAt, jg.goalId, j.salaryFrom, j.salaryTo
      FROM jobs j
      LEFT JOIN job_goals jg ON jg.jobId = j.jobId
      WHERE j.jobId = :jobId
    `;
    if (partnerCode) {
      jobQuery += ` and j.partnerCode = :partnerCode`;
      replacements.partnerCode = partnerCode;
    }
    if (!req.isAllJobs) {
      jobQuery += ` and j.isActive = true`;
      // jobQuery += ` and j.lastDateOfApply >= "${moment().format('YYYY-MM-DD')}"`;
    }
    let jobs = await sequelize.query(jobQuery, {
      type: sequelize.QueryTypes.SELECT,
      replacements
    });

    if(!jobs.length) {
      res.status(200).json({ status: true, data: null });
    }

    if(!userId) {
      return res.status(200).json({ status: true, data: jobs[0],});
    }

    if (!goalId) {
      let fetchJobGoal = await jobGoals.findOne({ where: { jobId } });
      goalId = fetchJobGoal ? fetchJobGoal.goalId : null;
    }

    if (jobs.employmentType == "Internship") {
      return res.status(400).json({ status: false, message: "No roadmap data for the Internship." });
    }

    const roadmapQuery = `
      SELECT 
        c.categoryId, c.categoryName, c.description AS categoryDescription, s.subCategoryId, s.subCategoryName, s.subCategoryDescription,
        ROUND(AVG(js.requiredSkillLevel)) AS requiredSkillLevel,
        ROUND(AVG(COALESCE(us.acquiredLevel, 0))) AS userSkillLevel,
        COUNT(DISTINCT grm.skillId) AS totalRoadmapSkills,
        COUNT(DISTINCT CASE WHEN COALESCE(us.acquiredLevel, 0) >= js.requiredSkillLevel THEN grm.skillId ELSE NULL END) AS skillsCompleted,
        COUNT(DISTINCT CASE WHEN js.skillId IS NOT NULL THEN js.skillId ELSE NULL END) AS totalJobSkills,
        COUNT(DISTINCT CASE WHEN js.skillId IS NOT NULL AND us.skillId IS NOT NULL AND COALESCE(us.acquiredLevel, 0) >= js.requiredSkillLevel THEN us.skillId ELSE NULL END) AS userJobSkills,
        CASE WHEN COUNT(CASE WHEN COALESCE(us.acquiredLevel, 0) < js.requiredSkillLevel THEN 1 END) = 0 THEN TRUE ELSE FALSE END AS isCertified
      FROM goal_road_maps grm
      JOIN categories c ON grm.categoryId = c.categoryId
      JOIN sub_categories s ON grm.subCategoryId = s.subCategoryId
      LEFT JOIN user_skills us ON grm.skillId = us.skillId AND us.userId = :userId
      JOIN job_skills js ON grm.skillId = js.skillId
      JOIN jobs j ON j.jobId
      WHERE js.jobId = :jobId AND grm.goalId = :goalId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
      GROUP BY c.categoryId, s.subCategoryId
      ORDER BY c.categoryId, s.subCategoryId;
    `;

    let roadmapdbData = await sequelize.query(roadmapQuery, {
      replacements: { userId, goalId, jobId },
      type: sequelize.QueryTypes.SELECT,
    });

    let userAcquiredJobSkillsCount = 0, totalJobSkillsCount = 0, userAcquiredRoadmapSkillsCount = 0, totalRoadmapSkillsCount = 0;

    const categoryMap = {};
    const categorySummary = {};

    roadmapdbData.forEach(item => {
      const { categoryId, categoryName, categoryDescription, subCategoryId, subCategoryName, subCategoryDescription, requiredSkillLevel, userSkillLevel, skillsCompleted, totalRoadmapSkills, totalJobSkills, userJobSkills, isCertified } = item;

      userAcquiredJobSkillsCount += userJobSkills;
      totalJobSkillsCount += totalJobSkills;
      userAcquiredRoadmapSkillsCount += skillsCompleted;
      totalRoadmapSkillsCount += totalRoadmapSkills;

      if (!categoryMap[categoryId]) {
        categoryMap[categoryId] = {
          categoryId,
          categoryName,
          categoryDescription,
          subCategories: []
        };

        categorySummary[categoryId] = {
          requiredSkillLevel: 0,
          userSkillLevel: 0,
          skillsCompleted: 0,
          isCertified: false,
          subCategoryCount: 0
        };
      }

      categoryMap[categoryId].subCategories.push({
        subCategoryId,
        subCategoryName,
        subCategoryDescription,
        requiredSkillLevel,
        userSkillLevel,
        skillsCompleted,
        isCertified
      });

      categorySummary[categoryId].requiredSkillLevel += +requiredSkillLevel;
      categorySummary[categoryId].userSkillLevel += +userSkillLevel;
      categorySummary[categoryId].skillsCompleted += +skillsCompleted;
      categorySummary[categoryId].subCategoryCount += 1;
      categorySummary[categoryId].isCertified = false;
    });

    const categorySummaries = Object.entries(categorySummary).map(([categoryId, summary]) => ({
      ...summary,
      requiredSkillLevel: summary.requiredSkillLevel ? (summary.requiredSkillLevel / summary.subCategoryCount).toFixed(2) : 0,
      userSkillLevel: summary.userSkillLevel ? (summary.userSkillLevel / summary.subCategoryCount).toFixed(2) : 0,
    }));

    const roadmapData = Object.values(categoryMap);

    jobs[0]['jobCumulativeSkillData'] = categorySummaries;
    jobs[0]['skillData'] = roadmapData;

    // updating user goals table if userId exists
    let query = `
      SELECT
        sp.expectedSalary, sx.startDate, sx.endDate, sx.isCurrent
      FROM student_experiences sx
      LEFT JOIN student_preferences sp ON sp.userId = sx.userId
      WHERE sx.userId = :userId;
    `;

    const studentData = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      replacements: {userId}
    });

    let expectedSalary = 0;

    let totalMonths = 0;

    if(studentData?.length) {
      studentData.forEach(experience => {
        const startDate = moment(experience.startDate);
        const endDate = experience.isCurrent ? moment() : moment(experience.endDate); 
        expectedSalary = experience.expectedSalary ? experience.expectedSalary : 0;

        if (startDate.isValid() && endDate.isValid()) {
          const months = endDate.diff(startDate, "months", true);
          totalMonths += Math.max(0, months);
        }
      });
      totalMonths = Math.round(totalMonths);
    }

    const avgJobSalary = jobs.salaryFrom && jobs.salaryTo ? (jobs.salaryFrom + jobs.salaryTo) / 2 : 0;

    const userGoalsObj = {
      jobProvidedSalary: avgJobSalary,
      userExpectedSalary: expectedSalary,
      salaryMatchInPercentage: avgJobSalary ? Math.floor(100 - (Math.abs(avgJobSalary - expectedSalary) * 100 / avgJobSalary)) : 0,
      userExperienceInMonths: totalMonths,
      jobExperienceInMonths: jobs?.minExperienceMonths || 0,
      experienceMatchInPercentage: jobs?.minExperienceMonths ? Math.min(100, Math.floor(totalMonths * 100 / jobs.minExperienceMonths)) : 0,
      userId, jobId, goalId, userAcquiredJobSkillsCount, totalJobSkillsCount, userAcquiredRoadmapSkillsCount, totalRoadmapSkillsCount,
      roadmapProgress: totalRoadmapSkillsCount ? Math.floor(userAcquiredRoadmapSkillsCount * 100 / totalRoadmapSkillsCount) : 0,
      jobProgress: totalJobSkillsCount ? Math.floor(userAcquiredJobSkillsCount * 100 / totalJobSkillsCount) : 0,
    }

    const userGoalsExists = await userGoals.findOne({
      where: {
        userId, goalId
      }
    });

    if(userGoalsExists) {
      await userGoals.update(userGoalsObj, {
        where: {
          userId, goalId
        }
      });
    } else {
      await userGoals.create(userGoalsObj);
      hrController.updateUserJobMetricFunc(userId);
    }

    res.status(200).json({ status: true, data: jobs[0],});

    if(jobId && partnerCode) {
      await updatePartnerJobMetrics({jobId, partnerCode});
      await updatePartnerOverallMetrics({partnerCode});
    }
  } catch (error) {
    console.error("Encountered an error while fetching job details: ", error);
    return res.status(400).json({ status: false, message: 'Unable to fetch job details.' });
  }
};

exports.getJobAssessments = async (req, res) => {
  try {
    const userId = req.userId;
    let { assessmentType = 'preRoadmap', assessmentCategory, goalId, jobId } = req.query;
    jobId = parseInt(jobId);
    goalId = parseInt(goalId);

    if (assessmentType == 'postRoadmap' && assessmentCategory != 'Technical' && assessmentCategory != 'Non-Technical') {
      return res.status(422).json({ status: false, message: 'assessmentCategory should be either Technical or Non-Technical' });
    }

    if (!jobId && !goalId) {
      return res.status(422).json({ status: false, message: 'Provide either jobId or goalId.' });
    }

    if (!jobId && goalId) {
      jobGoalData = await jobGoals.findOne({ where: { goalId } });
      jobId = jobGoalData.jobId;
    }

    let jobAssessmentsQuery = `SELECT 
      a.*, ja.jobId, IF(od.userId, 1, 0) AS isAddedToCart
    FROM
      job_assessments ja
    LEFT JOIN assessments a ON a.assessmentId = ja.assessmentId
    LEFT JOIN order_details od ON od.jobId = ja.jobId AND od.assessmentId = ja.assessmentId AND od.userId = ${userId}
    WHERE ja.jobId = ${jobId} AND 
      a.type = "${assessmentType}"`;
    if (assessmentType == 'postRoadmap' && assessmentCategory) {
      jobAssessmentsQuery += ` AND a.assessmentCategory = "${assessmentCategory}"`;
    }

    const jobAssessmentsData = await sequelize.query(jobAssessmentsQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    let result = [];
    for (let i = 0; i < jobAssessmentsData.length; i++) {
      let assessmentsData = [];
      assessmentsData.push(jobAssessmentsData[i])
      result.push({
        category: jobAssessmentsData[i].assessmentCategory,
        assessments: assessmentsData
      })
    }

    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Unable to fetch job assessment details.' });
  }
};

exports.addToDreamJobList = async (req, res, next) => {
  try {
    // const { jobId, goalId } = req.body;
    // const userId = req.userId;
    // const goalExists = await goals.findOne({ where: { goalId } });
    // if (!goalExists) {
    //   return res.status(404).json({ status: false, message: "Goal does not exists." });
    // }
    // const userGoalExists = await userGoals.findOne({ where: { userId, jobId, goalId } });
    // if (userGoalExists) {
    //   return res.status(200).json({ status: false, message: 'Already set as a goal.' });
    // }
    // await userGoals.create({ userId, goalId });

    const { jobId } = req.body;
    const userId = req.userId;
    const jobExists = await jobs.findOne({ where: { jobId, isActive: true } });
    if (!jobExists) {
      return res.status(404).json({ status: false, message: "Job does not exists." });
    }
    const userDreamJobExists = await userDreamJobs.findOne({ where: { userId, jobId } });
    if (userDreamJobExists) {
      return res.status(200).json({ status: false, message: 'Already added as dream job.' });
    }
    await userDreamJobs.create({ userId, jobId });
    return res.status(200).json({ status: true, message: "Added as dream job successfully." });
  } catch (error) {
    console.error('Error occurred while adding dream job.', error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

//* assessment
exports.handleAssessmentInvitation = async (req, res, userId, student, user, jobAssessment, jobId, assessmentCategory, assessmentType, assessmentFeeType, userAssessmentsDetails) => {
  try {
    let paymentData;
    let query = `
    SELECT * FROM order_details od 
    LEFT JOIN orders o ON o.orderId = od.orderId
    WHERE o.paymentStatus = "Completed" AND 
          od.assessmentId = ${jobAssessment.assessmentId} AND 
          od.userId = ${user.userId} 
    ORDER BY od.orderDetailId`;

    paymentData = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

    let userJobAssessmentsCount = await userAssessments.findAll({
      where: { userId, assessmentId: jobAssessment.assessmentId },
    });

    if (paymentData.length <= userJobAssessmentsCount.length) {
      return res.status(400).json({ status: false, message: 'Please complete the payment to enroll the new assessment.' });
    }

    let userAssessmentsCount = await userAssessments.findAll({ where: { userId } });

    maskedEmail = user.uniqueId + '_' + userAssessmentsCount.length + '@jcurve.tech';

    let isInvited = await userAssessments.findOne({
      where: {
        userId,
        assessmentId: jobAssessment.assessmentId,
        vendorAssessmentId: jobAssessment.vendorAssessmentId,
        [Op.and]: [
          { assessmentStatus: { [Op.ne]: 'COMPLETED' } },
          { assessmentStatus: { [Op.ne]: 'DISQUALIFIED' } },
          { assessmentStatus: { [Op.ne]: 'REJECTED' } },
        ],
      },
    });
    let invite;
    if (!isInvited) {
      invite = await axios.post(
        'https://api.testlify.com/v1/assessment/candidate/invites',
        {
          candidateInvites: [
            {
              firstName: student.firstName,
              lastName: student.lastName,
              email: maskedEmail,
              phoneExt: 91,
              phone: 0,
            },
          ],
          assessmentId: jobAssessment.vendorAssessmentId,
        },
        {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${process.env.TESTLIFY_ACCESS_TOKEN}`,
          },
        },
      );
    }

    if (isInvited || (invite.data.totalInvalid == 0 && invite.data.data[0].status == 'VALID')) {
      const link = await axios.post(
        `https://api.testlify.com/v1/assessment/${jobAssessment.vendorAssessmentId}/candidate/link`,
        {
          email: maskedEmail,
        },
        {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${process.env.TESTLIFY_ACCESS_TOKEN}`,
          },
        },
      );

      let userAssessmentsData = {
        assessmentId: jobAssessment.assessmentId,
        userId,
        jobId,
        assessmentCategory,
        assessmentProvider: jobAssessment.assessmentProvider,
        assessmentInvitationDetailsId: link.data.id,
        vendorAssessmentId: link.data.assessmentId,
        assessmentLink: link.data.inviteLink,
        assessmentType: assessmentType,
        assessmentStatus: 'INVITED',
        paymentId: paymentData[paymentData.length - 1].paymentId,
        assessmentFeeType
      };
      await userAssessments.create(userAssessmentsData);

      let { id, orgId, assessmentId, assessmentCandidateId, email, shortId, inviteKey, inviteLink, isExpired, lastModifiedBy, isPublic, type, timeObject, invitationLinkValidityStartDate, invitationLinkValidityEndDate, source, isPreview, created, modified, deleted } = link.data;

      await assessmentInvitationDetails.create({ testlifyId: id, orgId, userId: link.data.userId, assessmentId, assessmentCandidateId, email, shortId, inviteKey, inviteLink, isExpired, lastModifiedBy, isPublic, type, timeObject, invitationLinkValidityStartDate, invitationLinkValidityEndDate, source, isPreview, created, modified, deleted });

      res.status(200).json({ status: true, data: { assessmentLink: link.data.inviteLink } });
    } else {
      const link = await userAssessments.findAll({
        where: {
          userId,
          jobId,
          assessmentCategory: assessmentCategory ? assessmentCategory : null,
          vendorAssessmentId: jobAssessment.vendorAssessmentId,
          assessmentType: assessmentType,
          assessmentFeeType,
        }
      });
      const incompleteAssessment = link.find(
        (assessment) =>
          assessment.assessmentStatus != 'DISQUALIFIED' &&
          assessment.assessmentStatus != 'REJECTED' &&
          assessment.assessmentStatus != 'COMPLETED',
      );

      if (link.length > 0 && incompleteAssessment) {
        res.status(200).json({ status: true, data: { assessmentLink: incompleteAssessment.assessmentLink } });
      } else if (!link.length) {
        res.status(400).json({ status: false, message: 'Assessment link not found.' });
      } else {
        res.status(400).json({ status: false, message: 'Issue with assessment link.' });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: 'Internal server error.' });
  }
};

exports.getAssessmentLink = async (req, res, next) => {
  try {
    let userId = req.userId;
    const { jobId, assessmentId } = req.params;

    let user = await users.findOne({ where: { userId } });
    if (!user) {
      return res.status(400).json({ status: false, data: null, message: "User doesn't exists." });
    }

    let student = await students.findOne({ where: { userId } });
    if (!student) {
      return res.status(400).json({ status: false, data: null, message: "User doesn't exists." });
    }

    if (!student.firstName || !student.lastName || !user.secondaryEmail) {
      return res.status(422).json({ status: false, data: null, message: 'Some of the required user data is missing.' });
    }

    let job = await jobs.findOne({ where: { jobId, isActive: true } });
    if (!job) {
      return res.status(400).json({ status: false, data: null, message: "Job doesn't exists." });
    }

    const jobAssessment = await assessments.findOne({ where: { assessmentId } });
    if (!jobAssessment) {
      return res.status(404).json({ status: false, message: 'Assessment not found.' });
    }

    const { vendorAssessmentId, assessmentType, assessmentFeeType, assessmentCategory } = jobAssessment;

    const userAssessmentsDetails = await userAssessments.findAll({
      where: { userId, jobId, vendorAssessmentId, assessmentType, assessmentFeeType, assessmentCategory },
    });
    const incompleteAssessment = userAssessmentsDetails.find(
      (assessment) =>
        assessment.assessmentStatus != 'DISQUALIFIED' &&
        assessment.assessmentStatus != 'REJECTED' &&
        assessment.assessmentStatus != 'COMPLETED',
    );

    if (userAssessmentsDetails.length > 0) {
      if (!incompleteAssessment) {
        if (assessmentFeeType == 'Sponsored') {
          res.status(400).json({ status: false, message: `Sponsored assessment ${userAssessmentsDetails[userAssessmentsDetails.length - 1].assessmentStatus.toLowerCase()}.` });
        } else {
          let roadmapType = assessmentCategory ? 'postRoadmap' : 'preRoadmap';
          await this.handleAssessmentInvitation(req, res, userId, student, user, jobAssessment, jobId, assessmentCategory, roadmapType, assessmentFeeType, userAssessmentsDetails);
        }
      } else {
        res.status(200).json({ status: true, data: { assessmentLink: incompleteAssessment.assessmentLink } });
      }
    } else {
      let roadmapType = assessmentCategory ? 'postRoadmap' : 'preRoadmap';
      await this.handleAssessmentInvitation(req, res, userId, student, user, jobAssessment, jobId, assessmentCategory, roadmapType, assessmentFeeType, userAssessmentsDetails);
    }
  } catch (error) {
    console.error(error);
    return res.status(400).json({ status: false, message: 'Error while fetching assessment link.' });
  }
};

//* webhook to update user assessment status (TESTLIFY)
exports.webhookTestlify = async (req, res, next) => {
  try {
    const data = req.body.data;

    if (data && data.email && data.assessmentId) {
      const [localPart, domain] = data.email.split('@');
      const updatedLocalPart = localPart.replace(/_\d+$/, '');
      const secondaryEmail = `${updatedLocalPart}@${domain}`;

      let user = await users.findOne({
        where: { secondaryEmail: secondaryEmail },
      });
      if (user) {
        const userAssessment = await userAssessments.findOne({
          where: {
            userId: user.userId,
            testlifyAssessmentEmail: data.email,
            vendorAssessmentId: data.assessmentId,
            [Op.or]: [
              { assessmentStatus: { [Op.ne]: 'COMPLETED' } },
              { assessmentStatus: { [Op.ne]: 'DISQUALIFIED' } },
              { assessmentStatus: { [Op.ne]: 'REJECTED' } },
            ],
          },
          order: [['assessmentId', 'DESC']],
        });

        if (userAssessment) {
          let updatedAssessmentData = {
            assessmentStatus: data.status
          }
          if (data.status == 'COMPLETED' || data.status == 'DISQUALIFIED' || data.status == 'REJECTED') {
            updatedAssessmentData.totalQuestion = data.totalQuestion;
            updatedAssessmentData.totalScore = data.totalScore;
            updatedAssessmentData.totalScoreAchieved = data.totalScoreAchieved;
            updatedAssessmentData.avgScorePercentage = data.avgScorePercentage;
            updatedAssessmentData.totalTestTimeInSec = data.totalTestTimeLimit;
            updatedAssessmentData.totalTestElapsedTimeInSec = data.totalTestElapsedTime;
          }
          await userAssessments.update(
            updatedAssessmentData,
            { where: { userAssessmentId: userAssessment.userAssessmentId } },
          );

          const checkIfWebhookRecordExists =
            await assessmentWebhookDetails.findOne({
              where: {
                userId: user.userId,
                testlifyAssessmentEmail: data.email,
                vendorAssessmentId: data.assessmentId,
                status: data.status,
              },
            });

          if (!checkIfWebhookRecordExists) {
            // storing the data of all the events
            await assessmentWebhookDetails.create({
              userId: user.userId,
              testlifyAssessmentEmail: data.email,
              vendorAssessmentId: data.assessmentId,
              status: data.status,
              data: data,
            });

            if (data.status == 'COMPLETED' || data.status == 'DISQUALIFIED' || data.status == 'REJECTED') {
              // START- assessment report PDF generation
              setTimeout(async () => {

                async function downloadPDF(url, outputPath) {
                  try {
                    const response = await axios({
                      method: 'get',
                      url: url,
                      responseType: 'stream',
                    });

                    const writer = fs.createWriteStream(outputPath);

                    response.data.pipe(writer);

                    writer.on('finish', () => {
                      console.log(`Assessment Report generated - ${outputPath}`);
                    });

                    writer.on('error', (err) => {
                      console.error('Error generating the assessment file', err);
                    });
                  } catch (error) {
                    console.error('Error downloading the assessment file:', error);
                  }
                }

                const parsedUrl = new url.URL(data.resultLink);
                const filePath = parsedUrl.pathname;
                const fileName = path.basename(filePath);
                const outputPath = path.resolve(__dirname, '..') + '/resources/assessment_candidate_reports/' + fileName;

                downloadPDF(data.resultLink, outputPath);

                let assessmentReportLink = process.env.API_HOST_URL + 'assessment_candidate_reports/' + fileName;

                await userAssessments.update(
                  { assessmentReport: assessmentReportLink },
                  { where: { userAssessmentId: userAssessment.userAssessmentId } },
                );
              }, 180000);
              // END- assessment report PDF generation

              const email = user.email;
              const studentInfo = await students.findOne({ where: { userId: user.userId } });
              const assessmentInfo = await assessments.findOne({
                where: { vendorAssessmentId: data.assessmentId },
              });

              let subject = `Your Assessment Results for ${assessmentInfo.assessmentName}`;
              let mailBody = `
                    <html>
                    <head></head>
                    <body>
                        <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
                            <img src="${
                              process.env.API_HOST_URL
                            }logo.png" alt="JCurve">
                            <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                                <p>Hi ${studentInfo.firstName},</p>

                                <p>Your results for the ${
                                  assessmentInfo.assessmentName
                                } are now available. Log in to view your score and feedback.</p>
                    
                                <p>Best Regards,</p>
                                <p>Customer Success Team,</p>
                                <p>JCurve</p>
                            </div>
                            <p><small>© ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
                        </div>
                    </body>
                    </html>`;

              await sendMailer.sendMail(email, subject, mailBody);

              // processing skill wise results from data
              let testLibrary = data.testLibrary;
              let subCategoryArray = [];

              // grouping by skill & pushing all data to skill wise array
              for (let j = 0; j < testLibrary.length; j++) {
                let testlifySkills = data.testLibrary[j].skills;
                for (let i = 0; i < testlifySkills.length; i++) {
                  let testlifySkillName = testlifySkills[i].description
                    .replace('_Easy', '')
                    .replace('_Medium', '')
                    .replace('_Hard', '')
                    .replace('_Case', '')
                    .replace('_MCQ', '')
                    .replace('_difficultMCQ', '')
                    .replace('_easyMCQ', '')
                    .trim();

                  let subCategoryData = await subCategories.findAll({
                    where: {
                      [Op.or]: [
                        { subCategoryName: testlifySkillName },
                        { subCategoryName: { [Op.like]: `%${testlifySkillName}%` } },
                        Sequelize.where(
                          Sequelize.literal(`JSON_CONTAINS(keywords, '"${testlifySkillName}"')`),
                          true
                        ),
                      ],
                    },
                  });

                  if (subCategoryData.length > 0) {
                    for (let k = 0; k < subCategoryData.length; k++) {
                      let objectIndex = subCategoryArray.findIndex(
                        (e) => e.subCategoryName == subCategoryData[k].subCategoryName,
                      );

                      if (objectIndex == -1) {
                        subCategoryArray.push({
                          subCategoryId: subCategoryData[k].subCategoryId,
                          subCategoryName: subCategoryData[k].subCategoryName,
                          totalQuestions: testlifySkills[i].totalSkillQuestion,
                          attemptedQuestions:
                            testlifySkills[i].totalAttemptedSkillQuestion,
                          correctQuestions:
                            testlifySkills[i].totalCorrectSkillQuestion,
                          wrongQuestions: testlifySkills[i].totalWrongScoreQue,
                        });
                      } else {
                        if (testlifySkills[i].totalSkillQuestion) {
                          subCategoryArray[objectIndex].totalQuestions =
                            subCategoryArray[objectIndex].totalQuestions +
                            testlifySkills[i].totalSkillQuestion;
                          subCategoryArray[objectIndex].attemptedQuestions =
                            subCategoryArray[objectIndex].attemptedQuestions +
                            testlifySkills[i].totalAttemptedSkillQuestion;
                          subCategoryArray[objectIndex].correctQuestions =
                            subCategoryArray[objectIndex].correctQuestions +
                            testlifySkills[i].totalCorrectSkillQuestion;
                          subCategoryArray[objectIndex].wrongQuestions =
                            subCategoryArray[objectIndex].wrongQuestions +
                            testlifySkills[i].totalWrongScoreQue;
                        }
                      }
                    }
                  }
                }
              }

              // mapping skill wise data
              for (let i = 0; i < subCategoryArray.length; i++) {
                let totalSkillQuestionScorePercentage = (subCategoryArray[i].totalQuestions) ? parseInt((subCategoryArray[i].correctQuestions / subCategoryArray[i].totalQuestions) * 10) : 0;

                await userAssessmentSubCategoryWiseResults.create({
                  userId: user.userId,
                  vendorAssessmentId: data.assessmentId,
                  userAssessmentId: userAssessment.userAssessmentId,
                  subCategoryId: subCategoryArray[i].subCategoryId,
                  subCategoryName: subCategoryArray[i].subCategoryName,
                  totalQuestions: subCategoryArray[i].totalQuestions,
                  attemptedQuestions: subCategoryArray[i].attemptedQuestions,
                  correctQuestions: subCategoryArray[i].correctQuestions,
                  wrongQuestions: subCategoryArray[i].wrongQuestions,
                  percentage: totalSkillQuestionScorePercentage,
                });

                let fetchSkillsQuery = `
                SELECT s.skillId, s.skillName FROM skills s
                JOIN sub_category_skills scs ON scs.skillId = s.skillId
                WHERE scs.subCategoryId = ${subCategoryArray[i].subCategoryId}`;

                let skillsList = await sequelize.query(fetchSkillsQuery, {
                  type: sequelize.QueryTypes.SELECT,
                });

                for (let z = 0; z < skillsList.length; z++) {
                  let proficiencyLevel = totalSkillQuestionScorePercentage
                    ? (totalSkillQuestionScorePercentage <= 5
                      ? 5
                      : totalSkillQuestionScorePercentage >= 9
                        ? 9
                        : 7)
                    : 0;

                  // user skills
                  let userSkillCheck = await userSkills.findOne({
                    where: {
                      userId: user.userId,
                      skillId: skillsList[z].skillId,
                    }
                  });

                  if (userSkillCheck) {
                    if (proficiencyLevel > userSkillCheck.acquiredLevel) {
                      await userSkills.update(
                        { acquiredLevel: proficiencyLevel },
                        {
                          where: { id: userSkillCheck.id },
                        }
                      );
                    }
                  } else {
                    await userSkills.findOrCreate({
                      where: {
                        userId: user.userId,
                        skillId: skillsList[z].skillId,
                      },
                      defaults: {
                        acquiredLevel: proficiencyLevel,
                      },
                    });
                  }

                  // user job skills
                  let userJobSkillCheck = await userJobSkills.findOne({
                    where: {
                      userId: user.userId,
                      jobId: userAssessment.jobId,
                      skillId: skillsList[z].skillId,
                    }
                  });

                  if (userJobSkillCheck) {
                    if (proficiencyLevel > userJobSkillCheck.acquiredLevel) {
                      await userJobSkills.update(
                        { acquiredLevel: proficiencyLevel },
                        {
                          where: { id: userJobSkillCheck.id },
                        }
                      );
                    }
                  } else {
                    await userJobSkills.findOrCreate({
                      where: {
                        userId: user.userId,
                        jobId: userAssessment.jobId,
                        skillId: skillsList[z].skillId,
                      },
                      defaults: {
                        acquiredLevel: proficiencyLevel,
                      },
                    });
                  }

                }
                
              }
            }
          }
        }

        hrController.avgTrainingTimeFunc(user.userId);
        hrController.updateUserJobMetricSkills(user.userId);
      }
    }
    return res.status(200).json({ status: true });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ status: true });
  }
};

exports.fetchSimplilearnCourseLink = async (req, res, next) => {
  try {
    let userId = req.userId;
    const { goalId, curriculumId, courseId, materialId } = req.params;

    const user = await users.findOne({ where: { userId } });
    if (!user) {
      return res
        .status(404)
        .json({
          status: false,
          message: 'Invalid Credentials. Please try again.',
        });
    }

    const student = await students.findOne({ where: { userId: user.userId } });
    if (!student) {
      return res
        .status(404)
        .json({ status: false, message: 'Student data not found.' });
    }

    const SCORM_API_BASE_URL = process.env.SCORM_API_BASE_URL;
    const SCORM_API_KEY = process.env.SCORM_API_KEY;
    const SCORM_APP_ID = process.env.SCORM_APP_ID;
    const encoded = Buffer.from(SCORM_APP_ID + ':' + SCORM_API_KEY).toString(
      'base64',
    );
    const redirectOnExitUrl =
      process.env.WEB_HOST_URL +
      'app/goal/' +
      goalId +
      '/' +
      curriculumId +
      '/' +
      courseId;

    const material = await materials.findOne({
      where: {
        materialId,
      },
    });

    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: 'Material data not found.' });
    }

    if (!material.vendorCourseId) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Not Simplilearn Course. Course not found.',
        });
    }

    const { vendorCourseId } = material.dataValues;

    const alreadyRegistered = await userRegisteredCourses.findOne({
      where: { userId, materialId },
    });

    // if (alreadyRegistered && alreadyRegistered.isCourseCompleted) {
    //   return res.status(200).json({ status: true, isCourseCompleted: 1, message: "Course completed." });
    // }

    if (!alreadyRegistered) {
      const register = await axios.post(
        `${SCORM_API_BASE_URL}/registrations`,
        {
          courseId: vendorCourseId,
          learner: {
            id: user.secondaryEmail,
            email: user.secondaryEmail,
            firstName: student.firstName,
            lastName: student.lastName,
          },
          registrationId: `${user.uniqueId}-${vendorCourseId}-${materialId}`,
        },
        {
          headers: {
            Authorization: 'Basic ' + encoded,
          },
        },
      );

      const link = await axios.post(
        `${SCORM_API_BASE_URL}/registrations/${user.uniqueId}-${vendorCourseId}-${materialId}/launchLink`,
        {
          expiry: 120,
          redirectOnExitUrl: redirectOnExitUrl,
          tracking: true,
          launchAuth: {
            type: 'cookies',
            options: {
              ipAddress: true,
              fingerprint: true,
              expiry: 0,
              slidingExpiry: 0,
            },
          },
        },
        {
          headers: {
            Authorization: 'Basic ' + encoded,
          },
        },
      );

      await userRegisteredCourses.create({
        userId,
        materialId,
        scormCloudCourseId: vendorCourseId,
        scormCloudRegistrationId:
          user.uniqueId + '-' + vendorCourseId + '-' + materialId,
        scormCloudCourseLink: link?.data?.launchLink || null,
      });

      res.status(200).json({
        status: true,
        isCourseCompleted: 0,
        data: { link: link?.data?.launchLink || null },
      });
    } else {
      const { scormCloudRegistrationId } = alreadyRegistered;

      const link = await axios.post(
        `${SCORM_API_BASE_URL}/registrations/${scormCloudRegistrationId}/launchLink`,
        {
          expiry: 120,
          redirectOnExitUrl: redirectOnExitUrl,
          tracking: true,
          launchAuth: {
            type: 'cookies',
            options: {
              ipAddress: true,
              fingerprint: true,
              expiry: 0,
              slidingExpiry: 0,
            },
          },
        },
        {
          headers: {
            Authorization: 'Basic ' + encoded,
          },
        },
      );

      await userRegisteredCourses.update(
        { scormCloudCourseLink: link?.data?.launchLink || null },
        { where: { userId, materialId } },
      );

      res.status(200).json({
        status: true,
        isCourseCompleted: 0,
        data: { link: link?.data?.launchLink || null },
      });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        status: false,
        message: 'Something went wrong. Please try again later.',
      });
  }
};

exports.fetchSimplilearnCourseProgress = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { materialId } = req.params;

    const user = await users.findOne({ where: { userId } });
    if (!user) {
      return res
        .status(404)
        .json({
          status: false,
          message: 'Invalid Credentials. Please try again.',
        });
    }

    const student = await students.findOne({ where: { userId: user.userId } });
    if (!student) {
      return res
        .status(404)
        .json({ status: false, message: 'Student data not found.' });
    }

    const SCORM_API_BASE_URL = 'https://cloud.scorm.com/api/v2';
    const SCORM_API_KEY = 'cITXQdlFm6CnJ4OpZlwzpOf2pn09lxlAr7AGmnGU';
    const SCORM_APP_ID = 'AO86ENN71C';
    const encoded = Buffer.from(SCORM_APP_ID + ':' + SCORM_API_KEY).toString(
      'base64',
    );

    // const courses = await axios.get(`${SCORM_API_BASE_URL}/courses`, {
    //   headers: {
    //     'Authorization': 'Basic ' + encoded
    //   },
    // });

    const alreadyRegistered = await userRegisteredCourses.findOne({
      where: { userId, materialId },
    });

    const { scormCloudRegistrationId } = alreadyRegistered;
    // const courseProgress = await axios.get(
    //   `${SCORM_API_BASE_URL}/registrations/${scormCloudRegistrationId}?includeChildResults=true&includeInteractionsAndObjectives=true&includeRuntime=true`,
    //   {
    //     headers: {
    //       'Authorization': 'Basic ' + encoded
    //     },
    //   }
    // );
    const courseProgress = await axios.get(
      `${SCORM_API_BASE_URL}/registrations/${scormCloudRegistrationId}`,
      {
        headers: {
          Authorization: 'Basic ' + encoded,
        },
      },
    );

    return res.status(200).json({ status: true, data: courseProgress.data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        status: false,
        message: 'Something went wrong. Please try again later.',
      });
  }
};

exports.xapiSimplilearn = async (req, res, next) => {
  try {
    res.status(200).json({ status: true });
    const API_KEY = 'jc_test_cEApN5ZAQHtbBsDeqWiuo';
    const SECRET_KEY = '8MXTLcUEwY7MJFcvpc4pU1dCUaAKeiuCkgkug7nl';
    const data = req.body;
    xapiDatasets.create({ data });

    var courseSlugName =
      data.context.contextActivities.parent.id.match(/[^\/]+$/);
    if (!courseSlugName || courseSlugName[0] === '') {
      courseSlugName = null;
    } else {
      courseSlugName = courseSlugName[0];
    }
    if (courseSlugName) {
      const isCompleted = data.verb.display['en-US'] == 'completed' ? 1 : 0;
      const lessonName =
        data.object.definition.extensions[
          'https://enterpriselearninghub.lms.simplilearn.com/lessonName'
        ];
      const lessonId =
        data.object.definition.extensions[
          'https://enterpriselearninghub.lms.simplilearn.com/lessonId'
        ];
      const topicName =
        data.object.definition.extensions[
          'https://enterpriselearninghub.lms.simplilearn.com/topicName'
        ];
      const topicId =
        data.object.definition.extensions[
          'https://enterpriselearninghub.lms.simplilearn.com/topicId'
        ];
      const watchedDurationInSec = parseInt(
        data.object.definition.extensions[
          'https://enterpriselearninghub.lms.simplilearn.com/duration'
        ],
      );
      const videoLengthInSec = parseInt(
        data.object.definition.extensions[
          'https://enterpriselearninghub.lms.simplilearn.com/videoLen'
        ],
      );
      const courseProgress = parseInt(
        data.object.definition.extensions[
          'https://enterpriselearninghub.lms.simplilearn.com/courseProgress'
        ],
      );

      let userInfo = await users.findOne({
        where: { secondaryEmail: data.actor.mbox.split('mailto:')[1] },
      });
      let materialInfo = await materials.findOne({
        where: { vendorCourseNameSlug: courseSlugName },
      });

      if (userInfo && materialInfo) {
        let checkStatus = await userRegisteredCourses.findOne({
          where: {
            userId: userInfo.userId,
            materialId: materialInfo.materialId,
          },
        });
        if (checkStatus.isCourseCompleted) {
          return;
        }
        let recordExists = await userRegisteredCourseTracking.findOne({
          where: {
            userId: userInfo.userId,
            materialId: materialInfo.materialId,
            topicId,
            lessonId,
          },
        });

        if (recordExists) {
          await userRegisteredCourseTracking.update(
            { watchedDurationInSec, isCompleted },
            { where: { id: recordExists.id } },
          );
        } else {
          await userRegisteredCourseTracking.create({
            userId: userInfo.userId,
            materialId: materialInfo.materialId,
            lessonName,
            lessonId,
            topicName,
            topicId,
            videoLengthInSec,
            watchedDurationInSec,
          });
        }

        let isCourseCompleted = courseProgress == 100 ? 1 : 0;

        await userRegisteredCourses.update(
          { courseProgress, isCourseCompleted },
          {
            where: {
              userId: userInfo.userId,
              materialId: materialInfo.materialId,
            },
          },
        );
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(200).json({ status: true });
  }
};

exports.testlifyAssessmentData = async (req, res, next) => {
  try {
    const userId = req.userId;
    const testlifyAssessmentEmail = req.query.testlifyAssessmentEmail;

    const assessmentData = await assessmentWebhookDetails.findOne({
      where: {
        testlifyAssessmentEmail,
        status: 'COMPLETED',
      },
      attributes: ['data'],
    });

    return res.status(200).json({ status: true, assessmentData });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({
        status: false,
        message: 'Something went wrong. Please try again later.',
      });
  }
};

//* quiz
const getQuizAndRespond = async (res, userId, conditions) => {
  try {
    const existingQuiz = await courseQuiz.findOne({
      where: conditions,
    });

    if (!existingQuiz) {
      return res
        .status(404)
        .json({
          status: false,
          message: `Quiz not found with specified criteria.`,
        });
    }

    const quizId = existingQuiz.quizId;
    let quizAttempt = await quizTrack.findOne({ where: { quizId, userId } });
    const totalAttemptedQuestions = await questionTrack.count({
      where: { quizId, userId },
    });
    const totalQuestions = await quizQuestions.count({ where: { quizId } });

    if (quizAttempt && quizAttempt.dataValues.isSubmitted) {
      const data = {
        quizId,
        timeTaken:
          existingQuiz.dataValues.duration -
          quizAttempt.dataValues.remainingTime,
        totalMarks: existingQuiz.dataValues.totalMarks,
        securedMarks: quizAttempt.dataValues.securedMarks,
        totalQuestions,
        totalAttemptedQuestions,
      };
      return res
        .status(404)
        .json({ status: false, message: `Quiz is already attempted.`, data });
    }

    let whereCondition;
    if (!quizAttempt) {
      whereCondition = `qq.quizId = ${quizId} ORDER BY RAND() LIMIT 20`;
    } else {
      if (
        quizAttempt.assignedQuestionIds &&
        quizAttempt.assignedQuestionIds.length > 0
      ) {
        whereCondition = `qq.questionId IN (${quizAttempt.assignedQuestionIds})`;
      } else {
        whereCondition = `qq.quizId = ${quizId} ORDER BY RAND() LIMIT 20`;
      }
    }

    const query = `
      SELECT
        qq.questionId,
        qq.question,
        qq.optionA,
        qq.optionB,
        qq.optionC,
        qq.optionD,
        qq.marks,
        CASE WHEN qt.questionId IS NULL THEN FALSE ELSE TRUE END AS isAttempted,
        CASE WHEN qt.isSkipped IS NULL THEN 0 ELSE qt.isSkipped END AS isSkipped,
        CASE WHEN qt.userAnswer IS NULL THEN '' ELSE qt.userAnswer END AS userAnswer,
        CASE WHEN qt.underReview IS NULL THEN 0 ELSE qt.underReview END AS underReview    
      FROM
        quiz_questions qq
      LEFT JOIN
        question_tracks qt ON qq.questionId = qt.questionId AND qt.userId = ${userId}
      WHERE
        ${whereCondition};`;

    const questionsData = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
    });

    let newQuestionIds = [];
    // Organizing data into the desired format
    questionsData.sort((a, b) => a.questionId - b.questionId);
    const formattedQuestions = questionsData.map((question) => {
      newQuestionIds.push(question.questionId);
      return {
        questionId: question.questionId,
        question: question.question,
        answersList: [
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
        ],
        marks: question.marks,
        isAttempted: question.isAttempted,
        isSkipped: question.isSkipped,
        userAnswer: question.userAnswer,
        underReview: question.underReview,
      };
    });

    if (!quizAttempt) {
      await quizTrack.create({
        quizId,
        userId,
        remainingTime: existingQuiz.dataValues.duration,
        assignedQuestionIds: newQuestionIds.length > 0 ? newQuestionIds : null,
      });
    } else if (!quizAttempt.assignedQuestionIds && newQuestionIds.length > 0) {
      await quizTrack.update(
        { assignedQuestionIds: newQuestionIds },
        { where: { id: quizAttempt.id } },
      );
    }

    const notAnsweredCount = await questionTrack.count({
      where: { userId, quizId, isSkipped: 1 },
    });
    const underReviewCount = await questionTrack.count({
      where: { userId, quizId, underReview: 1 },
    });

    const data = {
      quizId,
      questions: formattedQuestions,
      remainingTime: quizAttempt
        ? quizAttempt.dataValues.remainingTime
        : existingQuiz.dataValues.duration,
      totalQuestions,
      notSeenCount: totalQuestions - totalAttemptedQuestions,
      notAnsweredCount,
      underReviewCount,
      answeredCount: totalAttemptedQuestions - notAnsweredCount,
    };

    return res.status(200).json({ status: true, data });
  } catch (error) {
    console.error('Error fetching quiz details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getQuestionsByCourseAndLevel = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { courseId, level } = req.params;

    let userCourseExist = await userCourses.findOne({ where: { courseId } });
    if (!userCourseExist) {
      return res
        .status(404)
        .json({ status: false, message: 'User course not found.' });
    }

    await getQuizAndRespond(res, userId, { courseId, level });
  } catch (error) {
    console.error('Error getting questions by courseId and level:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getQuestionsByGoalIdAndCurriculumId = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { goalId, curriculumId } = req.params;

    const goalExists = await goals.findOne({ where: { goalId } });
    if (!goalExists) {
      return res
        .status(404)
        .json({ status: false, message: 'Goal not found.' });
    }

    const curriculumExists = await curriculums.findOne({
      where: { curriculumId },
    });
    if (!curriculumExists) {
      return res
        .status(404)
        .json({ status: false, message: 'Curriculum not found.' });
    }

    await getQuizAndRespond(res, userId, { goalId, curriculumId });
  } catch (error) {
    console.error('Error getting questions by goalId and curriculumId:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateQuizRemainingTime = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { quizId, remainingTime } = req.body;

    const existingQuiz = await courseQuiz.findOne({
      where: { quizId },
    });

    if (!existingQuiz) {
      return res
        .status(404)
        .json({
          status: false,
          message: `Quiz with quizId ${quizId} not found`,
        });
    }

    const quizAttempt = await quizTrack.findOne({
      where: { quizId, userId },
    });
    if (!quizAttempt)
      return res
        .status(404)
        .json({ status: false, message: `Quiz is not started.` });
    if (quizAttempt && quizAttempt.dataValues.isSubmitted)
      return res
        .status(404)
        .json({ status: false, message: `Quiz is already submitted.` });
    if (
      remainingTime > quizAttempt.dataValues.remainingTime &&
      remainingTime > 0
    )
      return res
        .status(404)
        .json({
          status: false,
          message: `Remaining Time should be less than the previous remaining Time and should be greater than 0.`,
        });
    await quizTrack.update({ remainingTime }, { where: { quizId, userId } });
    const data = {
      remainingTime,
      quizId,
    };
    return res.status(200).json({
      status: true,
      data,
      message: 'Remaining Time Updated Successfully.',
    });
  } catch (error) {
    console.error('Error getting while updating remainingTime', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateQuizStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {
      quizId,
      questionId,
      underReview,
      isSkipped,
      userAnswer,
      isSubmitted,
    } = req.body;
    if (!quizId) {
      return res.status(400).json({
        status: false,
        message: 'QuizId is required.',
      });
    }
    const existingQuiz = await courseQuiz.findOne({ where: { quizId } });
    if (!existingQuiz)
      return res
        .status(404)
        .json({
          status: false,
          message: `Quiz with quizId ${quizId} not found`,
        });

    const quizAttempt = await quizTrack.findOne({
      where: { quizId, userId },
    });

    if (!quizAttempt)
      return res
        .status(404)
        .json({ status: false, message: `Quiz is not started.` });
    if (
      quizAttempt &&
      (quizAttempt.dataValues.isSubmitted ||
        quizAttempt.dataValues.remainingTime == 0)
    )
      return res
        .status(404)
        .json({ status: false, message: `Quiz is already completed.` });
    if (isSubmitted === 1) {
      await quizTrack.update(
        { isSubmitted: 1 },
        {
          where: {
            quizId,
            userId,
          },
        },
      );
      return res.status(200).json({
        status: true,
        data: {
          quizId,
        },
        message: 'Quiz submitted successfully.',
      });
    }
    if (!questionId) {
      return res.status(400).json({
        status: false,
        message: 'questionId is required.',
      });
    }
    const existingQuestion = await quizQuestions.findOne({
      where: { questionId },
    });
    if (!existingQuestion)
      return res
        .status(404)
        .json({
          status: false,
          message: `Question with questionId ${questionId} not found`,
        });

    const existingQuestionTrack = await questionTrack.findOne({
      where: { questionId, userId },
    });
    let changes = {};
    if (isSkipped) {
      changes.isSkipped = 1;
      changes.userAnswer = '';
      if (
        existingQuestionTrack &&
        existingQuestion.dataValues.answer ===
        existingQuestionTrack.dataValues.userAnswer
      ) {
        await quizTrack.decrement('securedMarks', {
          by: existingQuestion.dataValues.marks,
          where: { userId, quizId },
        });
      }
    } else if (userAnswer) {
      changes.isSkipped = 0;
      changes.userAnswer = userAnswer;
      if (
        existingQuestionTrack &&
        existingQuestion.dataValues.answer ===
        existingQuestionTrack.dataValues.userAnswer &&
        existingQuestion.dataValues.answer != userAnswer
      ) {
        await quizTrack.decrement('securedMarks', {
          by: existingQuestion.dataValues.marks,
          where: { userId, quizId },
        });
      }
      if (
        ((existingQuestionTrack &&
          existingQuestion.dataValues.answer !=
          existingQuestionTrack.dataValues.userAnswer) ||
          !existingQuestionTrack) &&
        existingQuestion.dataValues.answer === userAnswer
      ) {
        await quizTrack.increment('securedMarks', {
          by: existingQuestion.dataValues.marks,
          where: { userId, quizId },
        });
      }
    }
    if (underReview) changes.underReview = 1;
    else changes.underReview = 0;
    if (Object.keys(changes).length < 1) {
      return res.status(400).json({
        status: false,
        message: 'Nothing to update.',
      });
    }
    let newTrack;
    if (existingQuestionTrack) {
      await questionTrack.update(changes, {
        where: {
          questionId,
          userId,
        },
      });
    } else {
      changes.quizId = quizId;
      changes.userId = userId;
      changes.questionId = questionId;
      await questionTrack.create(changes);
    }
    newTrack = await questionTrack.findOne({ where: { questionId, userId } });
    const data = newTrack.dataValues;
    return res.status(200).json({
      status: true,
      data,
      message: 'question status updated successfully.',
    });
  } catch (error) {
    console.error('Error getting while updating quiz status.', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.analyzeResumeFile = async (req, res, next) => {
  try {
    let jobId = parseInt(req.body.jobId);
    let userId = parseInt(req.userId);
    let partnerCode = req.query.partnerCode;

    if (!userId) {
      return res.status(422).json({ status: false, message: "User ID is required." })
    }

    let findUser = await users.findOne({ where: { userId } });
    if (!findUser) {
      return res.status(400).json({ status: false, message: "User not found." });
    }

    if (!jobId) {
      return res.status(422).json({ status: false, message: "Job ID is required." });
    }

    let jobData = await jobs.findOne({ where: { jobId } });
    if (!jobData) {
      return res.status(422).json({ status: false, message: "Job not found. Invalid jobId." });
    }

    if (!req.files || !req.files.resumeFile) {
      return res.status(422).json({ status: false, data: 'Resume file is required.' });
    }

    if (req.files.resumeFile[0].mimetype != "application/pdf") {
      return res.status(422).json({ status: false, data: 'Unsupported file format. Only pdf file format is allowed.' });
    }

    await userDreamJobs.findOrCreate({ where: { userId, jobId } });

    const skillsMapping = async (userId, matchedSkills, otherSkills) => {
      try {
        const matchedSkillsArray = [];
        const unmatchedSkillsArray = [];
        let curriculumSkills = await jobSkills.findAll({ where: { jobId, isCurriculumSkill: true } });

        for (let i = 0; i < curriculumSkills.length; i++) {
          let userSkillRecordCheck = await userSkills.findOne({ where: { userId, skillId: curriculumSkills[i].skillId } });
          if (userSkillRecordCheck) {
            if (userSkillRecordCheck.resumeSkillLevel < 5) {
              await userSkills.update(
                { resumeSkillLevel: 5 },
                {
                  where: { id: userSkillRecordCheck.id }
                }
              );
            }
          } else {
            await userSkills.create({
              userId,
              skillId: curriculumSkills[i].skillId,
              resumeSkillLevel: 5
            });
          }

          let userJobSkillRecordCheck = await userJobSkills.findOne({ where: { userId, jobId, skillId: curriculumSkills[i].skillId } });
          if (userJobSkillRecordCheck) {
            if (userJobSkillRecordCheck.resumeSkillLevel < 5) {
              await userJobSkills.update(
                { resumeSkillLevel: 5 },
                {
                  where: { id: userJobSkillRecordCheck.id }
                }
              );
            }
          } else {
            await userJobSkills.create({
              userId,
              jobId,
              skillId: curriculumSkills[i].skillId,
              resumeSkillLevel: 5
            });
          }
        }

        let allSkills = [...matchedSkills, ...otherSkills];

        for (let i = 0; i < allSkills.length; i++) {
          let skillId = allSkills[i].skillId ? allSkills[i].skillId : null;
          if (!skillId) {
            let query = `SELECT js.* FROM job_skills js
            LEFT JOIN skills s ON s.skillId = js.skillId
            WHERE s.skillNameSlug = "${(allSkills[i].skillName).toLowerCase().replace('c++', 'c-plus-plus').replace('c#', 'c-sharp').replace('/', '-').replace(/[^a-z0-9\s-]/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')}"`;
            let findSkill = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
            skillId = findSkill.length ? findSkill[0].skillId : null
          }

          let proficiencyLevel = (allSkills[i].proficiencyLevel <= 5) ? 5 : (allSkills[i].proficiencyLevel >= 9) ? 9 : 7;

          if (skillId) {
            let skillExists = matchedSkillsArray.some(e => e.skillId == skillId);
            if (!skillExists) {
              matchedSkillsArray.push({
                skillId: skillId,
                skillName: allSkills[i].skillName,
                proficiencyLevel: proficiencyLevel
              });

              let userSkillRecordCheck = await userSkills.findOne({ where: { userId, skillId: skillId } });
              if (userSkillRecordCheck) {
                if (proficiencyLevel > userSkillRecordCheck.resumeSkillLevel) {
                  await userSkills.update(
                    { resumeSkillLevel: proficiencyLevel },
                    {
                      where: { id: userSkillRecordCheck.id }
                    }
                  );
                }
              } else {
                await userSkills.create({
                  userId,
                  skillId: skillId,
                  resumeSkillLevel: proficiencyLevel
                });
              }

              let userJobSkillRecordCheck = await userJobSkills.findOne({ where: { userId, jobId, skillId: skillId } });
              if (userJobSkillRecordCheck) {
                if (proficiencyLevel > userJobSkillRecordCheck.resumeSkillLevel) {
                  await userJobSkills.update(
                    { resumeSkillLevel: proficiencyLevel },
                    {
                      where: { id: userJobSkillRecordCheck.id }
                    }
                  );
                }
              } else {
                await userJobSkills.create({
                  userId,
                  jobId,
                  skillId: skillId,
                  resumeSkillLevel: proficiencyLevel
                });
              }
            }
          } else {
            let skillExists = unmatchedSkillsArray.some(e => e.skillName == allSkills[i].skillName);
            if (!skillExists) {
              unmatchedSkillsArray.push({
                skillName: allSkills[i].skillName,
                proficiencyLevel: proficiencyLevel
              });

              await userOtherSkills.findOrCreate({
                where: {
                  userId,
                  skillName: allSkills[i].skillName
                },
                defaults: {
                  resumeSkillLevel: proficiencyLevel
                }
              });
            }
          }
        }

        console.log("Skill mapping finished."); //! TO BE REMOVED
        return { matchedSkillsArray, unmatchedSkillsArray };
      } catch (error) {
        console.error(error);
      }
    }

    const educationDetailsMapping = async (userId, education) => {
      try {
        for (let i = 0; i < education.length; i++) {
          if (education[i].institution && education[i].degree) {
            let startDate = education[i].start ? moment(education[i].start).format('YYYY-MM-DD') : null;
            let endDate = education[i].end && education[i].end !== "Present" ? moment(education[i].end).format('YYYY-MM-DD') : null;
            let isCurrent = education[i].end === "Present";

            if (startDate && endDate && moment(endDate).isBefore(startDate)) {
              startDate = null;
              endDate = null;
            }

            let educationData = {
              userId,
              collegeId: 2713,
              otherCollegeName: education[i].institution,
              qualificationId: 3,
              otherQualificationName: null,
              specializationId: 276,
              otherSpecializationName: education[i].degree,
              startDate: startDate,
              endDate: endDate,
              isCurrent: isCurrent,
            };

            let check = await studentEducations.findOne({ where: { userId, otherCollegeName: education[i].institution } });
            if (!check) {
              await studentEducations.create(educationData);
            }
            console.log("Education details mapping finished."); //! TO BE REMOVED
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    const workHistoryMapping = async (userId, experience) => {
      try {
        for (let i = 0; i < experience.length; i++) {
          if (experience[i].title && experience[i].company) {
            let startDate = experience[i].start ? moment(experience[i].start).format('YYYY-MM-DD') : null;
            let endDate = experience[i].end && experience[i].end !== "Present" ? moment(experience[i].end).format('YYYY-MM-DD') : null;
            let isCurrent = experience[i].end === "Present";

            if (startDate && endDate && moment(endDate).isBefore(startDate)) {
              startDate = null;
              endDate = null;
            }

            let experienceData = {
              userId,
              jobTitle: experience[i].title,
              companyId: 501,
              otherCompanyName: experience[i].company,
              startDate: startDate,
              endDate: endDate,
              isCurrent: isCurrent,
              location: experience[i].location,
              employmentType: "Full Time",
              responsibilities: experience[i].responsibilities,
            };

            let check = await studentExperiences.findOne({ where: { userId, otherCompanyName: experience[i].company } });
            if (!check) {
              await studentExperiences.create(experienceData);
            }
            console.log("Work history details mapping finished."); //! TO BE REMOVED
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    let fullPath = req.files.resumeFile[0].path;
    let relativePath = path.relative('resources', fullPath);
    let resumeFilePath = '/' + relativePath.replace(/\\/g, '/');
    let resumeFileName = req.files.resumeFile[0].originalname;
    
    let filePath = req.files.resumeFile[0].path;
    let resumeData = await fetchSkillsFromResume.processResume(filePath, jobId);

    if (!resumeData) {
      return res.status(404).json({ status: true, message: "No data found in the resume / Unable to analyse the resume." });
    }

    var parsedData;
    try {
      parsedData = JSON.parse(resumeData);
    } catch (error) {
      console.error(error);
      parsedData = null
    }

    var email = null;
    var jobSkillsCount;
    var matchedSkillsCount;
    var unmatchedSkillsCount;
    var acquiredSkillsCount;
    var partiallyAcquiredSkillsCount;
    if (parsedData) {
      email = (parsedData.candidate_summary?.email ?? '').trim().toLowerCase();

      if (!email) {
        return res.status(404).json({ status: true, message: "No candidate data found in the resume / Unable to analyse the resume." });
      }
      
      if (findUser.email != email) {
        return res.status(400).json({ status: true, message: "The email in the uploaded resume does not match the logged-in user's email." });
      }

      let phoneNumberString = parsedData.candidate_summary?.phoneNumber;
      if (phoneNumberString) {
        const phoneRegex = /(?:\+91|91)?[-.\s]?(\d{10})/;

        const phoneMatch = phoneNumberString.match(phoneRegex);
        let countryCode = 91;
        let phoneNumber = null;
        if (phoneMatch) {
          phoneNumber = phoneMatch[1];
        }
        let phoneNumberCheck = await users.findOne({ where: { phoneNumber } });
        if (!phoneNumberCheck) {
          await users.update({ countryCode, phoneNumber }, { where: { userId } });
        }
      }

      let { address = null, city = null, state = null, country = null, postalCode = null } = parsedData.candidate_summary?.location;

      studentDataUpdateObj = { resumeFilePath }
      if (address) {
        studentDataUpdateObj['address'] = address
      }
      if (city) {
        studentDataUpdateObj['city'] = city
      }
      if (state) {
        studentDataUpdateObj['state'] = state
      }
      if (country) {
        studentDataUpdateObj['country'] = country
      }
      if (postalCode) {
        studentDataUpdateObj['postalCode'] = postalCode
      }
      await students.update(studentDataUpdateObj, { where: { userId } });

      let education = parsedData.candidate_summary.education;
      let experience = parsedData.candidate_summary.experience;

      let result = await skillsMapping(userId, parsedData.matchedSkills, parsedData.otherSkills);
      parsedData.matchedSkills = result.matchedSkillsArray;
      delete parsedData.otherSkills;
      parsedData.unmatchedSkills = result.unmatchedSkillsArray;

      let findEducation = await studentEducations.findOne({ where: { userId } });
      if (!findEducation) {
        await educationDetailsMapping(userId, education);
      }
      let findWorkHistory = await studentExperiences.findOne({ where: { userId } });
      if (!findWorkHistory) {
        await workHistoryMapping(userId, experience);
      }
      
      await this.profileCompletionPercentageFunc(userId);
    
      jobSkillsCount = await jobSkills.count({ where: { jobId } });

      matchedSkillsCount = await userJobSkills.count({
        where: {
          userId,
          jobId,
          resumeSkillLevel: {
            [Sequelize.Op.not]: null,
          },
        },
      });

      unmatchedSkillsCount = await userOtherSkills.count({ where: { userId } });

      acquiredSkillsCount = await userJobSkills.count({
        where: {
          userId,
          jobId,
          resumeSkillLevel: {
            [Sequelize.Op.gte]: 7,
          },
        },
      });

      partiallyAcquiredSkillsCount = await userJobSkills.count({
        where: {
          userId,
          jobId,
          resumeSkillLevel: {
            [Sequelize.Op.not]: null,
            [Sequelize.Op.lt]: 7,
          },
        },
      });

      await userDreamJobs.update(
        {
          jobSkillsCount: jobSkillsCount,
          matchedSkillsCount: matchedSkillsCount,
          unmatchedSkillsCount: unmatchedSkillsCount,
          acquiredSkillsCount: acquiredSkillsCount,
          partiallyAcquiredSkillsCount: partiallyAcquiredSkillsCount
        },
        {
          where: {
            userId, jobId
          }
        }
      );
    }

    await resumeExtractions.create({
      jobId,
      userId,
      email,
      resumeFileName,
      rawData: resumeData,
      parsedData: parsedData
    });

    console.log(resumeFileName, ' - resume processing finished.'); //! TO BE REMOVED

    await hrController.updateUserJobMetricFunc(userId);

    const assessmentReportRes = await hrController.assessmentReportDataFunc(userId, { jobId, partnerCode });

    if (!assessmentReportRes.status) {
      return res.status(assessmentReportRes.statusCode).json({ status: assessmentReportRes.status, message: assessmentReportRes.message });
    }
    
    return res.status(assessmentReportRes.statusCode).json({ status: assessmentReportRes.status, data: assessmentReportRes.data });
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
}

exports.readDataFromResumes = async (req, res, next) => {
  try {
    const { jobId, jobFolder } = req.query;
    console.log(jobId, jobFolder);

    if (!jobFolder) {
      res.status(422).json({ status: false, message: "Folder name is required." });
    }

    const userAccountCreation = async (email, name) => {
      try {
        let userExits = await users.findOne({ where: { email } });
        if (!userExits) {
          let uniqueId = null;
          let existingUser = null;
          do {
            uniqueId = generateUniqueId();
            uniqueId = `QA_JC${uniqueId}`;
            existingUser = await users.findOne({ where: { uniqueId } });
          } while (existingUser);

          let secondaryEmail = `${uniqueId}@jcurve.tech`;

          let partnerCode = process.env.PARTNER_CODE;

          const createUser = await users.create({
            email,
            isVerified: 0,
            registerStep: 1,
            uniqueId,
            secondaryEmail,
            isActive: 0
          });

          if (createUser) {
            const studentRole = await roles.findOne({ where: { roleName: 'Student' } });
            if (!studentRole) {
              return res.status(404).json({ status: false, message: "Role doesn't exist." });
            }

            await userRoles.create(
              { userId: createUser.userId, roleId: studentRole.roleId }
            );

            const nameParts = name.split(' ');
            const lastName = nameParts.pop();
            const firstName = nameParts.join(' ');

            await students.create({ userId: createUser.userId, firstName, lastName });
            if (partnerCode) {
              await userPartnerCodes.create({ userId: createUser.userId, partnerCode });
            }
          }

          console.log("Account creation finished."); //! TO BE REMOVED
        }
      } catch (error) {
        console.error(error);
      }
    };

    const skillsMapping = async (userId, matchedSkills, otherSkills) => {
      try {
        const matchedSkillsArray = [];
        const unmatchedSkillsArray = [];
        let curriculumSkills = await jobSkills.findAll({ where: { jobId, isCurriculumSkill: true } });

        for (let i = 0; i < curriculumSkills.length; i++) {
          let userSkillRecordCheck = await userSkills.findOne({ where: { userId, skillId: curriculumSkills[i].skillId } });
          if (userSkillRecordCheck) {
            if (userSkillRecordCheck.resumeSkillLevel < 5) {
              await userSkills.update(
                { resumeSkillLevel: 5 },
                {
                  where: { id: userSkillRecordCheck.id }
                }
              );
            }
          } else {
            await userSkills.create({
              userId,
              skillId: curriculumSkills[i].skillId,
              resumeSkillLevel: 5
            });
          }

          let userJobSkillRecordCheck = await userJobSkills.findOne({ where: { userId, jobId, skillId: curriculumSkills[i].skillId } });
          if (userJobSkillRecordCheck) {
            if (userJobSkillRecordCheck.resumeSkillLevel < 5) {
              await userJobSkills.update(
                { resumeSkillLevel: 5 },
                {
                  where: { id: userJobSkillRecordCheck.id }
                }
              );
            }
          } else {
            await userJobSkills.create({
              userId,
              jobId,
              skillId: curriculumSkills[i].skillId,
              resumeSkillLevel: 5
            });
          }
        }

        let allSkills = [...matchedSkills, ...otherSkills];

        for (let i = 0; i < allSkills.length; i++) {
          let skillId = allSkills[i].skillId ? allSkills[i].skillId : null;
          if (!skillId) {
            let query = `SELECT js.* FROM job_skills js
            LEFT JOIN skills s ON s.skillId = js.skillId
            WHERE s.skillNameSlug = "${(allSkills[i].skillName).toLowerCase().replace('c++', 'c-plus-plus').replace('c#', 'c-sharp').replace('/', '-').replace(/[^a-z0-9\s-]/g, '').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-')}"`;
            let findSkill = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
            skillId = findSkill.length ? findSkill[0].skillId : null
          }

          let proficiencyLevel = (allSkills[i].proficiencyLevel <= 5) ? 5 : (allSkills[i].proficiencyLevel >= 9) ? 9 : 7;

          if (skillId) {
            let skillExists = matchedSkillsArray.some(e => e.skillId == skillId);
            if (!skillExists) {
              matchedSkillsArray.push({
                skillId: skillId,
                skillName: allSkills[i].skillName,
                proficiencyLevel: proficiencyLevel
              });

              let userSkillRecordCheck = await userSkills.findOne({ where: { userId, skillId: skillId } });
              if (userSkillRecordCheck) {
                if (proficiencyLevel > userSkillRecordCheck.resumeSkillLevel) {
                  await userSkills.update(
                    { resumeSkillLevel: proficiencyLevel },
                    {
                      where: { id: userSkillRecordCheck.id }
                    }
                  );
                }
              } else {
                try {
                  await userSkills.create({
                    userId,
                    skillId: skillId,
                    resumeSkillLevel: proficiencyLevel
                  });
                } catch (error) {
                  console.log(error);
                }
              }

              let userJobSkillRecordCheck = await userJobSkills.findOne({ where: { userId, jobId, skillId: skillId } });
              if (userJobSkillRecordCheck) {
                if (proficiencyLevel > userJobSkillRecordCheck.resumeSkillLevel) {
                  await userJobSkills.update(
                    { resumeSkillLevel: proficiencyLevel },
                    {
                      where: { id: userJobSkillRecordCheck.id }
                    }
                  );
                }
              } else {
                await userJobSkills.create({
                  userId,
                  jobId,
                  skillId: skillId,
                  resumeSkillLevel: proficiencyLevel
                });
              }
            }
          } else {
            let skillExists = unmatchedSkillsArray.some(e => e.skillName == allSkills[i].skillName);
            if (!skillExists) {
              unmatchedSkillsArray.push({
                skillName: allSkills[i].skillName,
                proficiencyLevel: proficiencyLevel
              });

              await userOtherSkills.findOrCreate({
                where: {
                  userId,
                  skillName: allSkills[i].skillName
                },
                defaults: {
                  resumeSkillLevel: proficiencyLevel
                }
              });
            }
          }
        }

        console.log("Skill mapping finished."); //! TO BE REMOVED
        return { matchedSkillsArray, unmatchedSkillsArray };
      } catch (error) {
        console.error(error);
      }
    }

    const educationDetailsMapping = async (userId, education) => {
      try {
        for (let i = 0; i < education.length; i++) {
          if (education[i].institution && education[i].degree) {
            let startDate = education[i].start ? moment(education[i].start).format('YYYY-MM-DD') : null;
            let endDate = education[i].end && education[i].end !== "Present" ? moment(education[i].end).format('YYYY-MM-DD') : null;
            let isCurrent = education[i].end === "Present";

            if (startDate && endDate && moment(endDate).isBefore(startDate)) {
              startDate = null;
              endDate = null;
            }

            let educationData = {
              userId,
              collegeId: 2713,
              otherCollegeName: education[i].institution,
              qualificationId: 3,
              otherQualificationName: null,
              specializationId: 276,
              otherSpecializationName: education[i].degree,
              startDate: startDate,
              endDate: endDate,
              isCurrent: isCurrent,
            };
            await studentEducations.create(educationData);

            console.log("Education details mapping finished."); //! TO BE REMOVED
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    const workHistoryMapping = async (userId, experience) => {
      try {
        for (let i = 0; i < experience.length; i++) {
          if (experience[i].title && experience[i].company) {
            let startDate = experience[i].start ? moment(experience[i].start).format('YYYY-MM-DD') : null;
            let endDate = experience[i].end && experience[i].end !== "Present" ? moment(experience[i].end).format('YYYY-MM-DD') : null;
            let isCurrent = experience[i].end === "Present";

            if (startDate && endDate && moment(endDate).isBefore(startDate)) {
              startDate = null;
              endDate = null;
            }

            let experienceData = {
              userId,
              jobTitle: experience[i].title,
              companyId: 501,
              otherCompanyName: experience[i].company,
              startDate: startDate,
              endDate: endDate,
              isCurrent: isCurrent,
              location: experience[i].location,
              employmentType: "Full Time",
              responsibilities: experience[i].responsibilities,
            };

            await studentExperiences.create(experienceData);
            console.log("Work history details mapping finished."); //! TO BE REMOVED
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    const folderPath = path.join(__dirname, `../resources/Resumes/${jobFolder}`);
    console.log("folderPath : ", folderPath); //! TO BE REMOVED

    const files = fs.readdirSync(folderPath);
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const resumeFileName = path.basename(filePath);
      console.log(resumeFileName, ' - resume processing started.'); //! TO BE REMOVED
      if (fs.statSync(filePath).isFile()) {
        let resumeData = await fetchSkillsFromResume.processResume(filePath, jobId);

        var parsedData;
        try {
          parsedData = JSON.parse(resumeData);
        } catch (error) {
          console.error(error);
          parsedData = null
        }

        var userId = null;
        var email = null;

        if (parsedData) {
          email = (parsedData.candidate_summary?.email ?? '').trim();
          if (email) {
            let checkIfUserExists = await users.findOne({ where: { email } });
            let name = (parsedData.candidate_summary.name).trim();
            let education = parsedData.candidate_summary.education;
            let experience = parsedData.candidate_summary.experience;

            await userAccountCreation(email, name);

            let findUser = await users.findOne({ where: { email } });
            let result = await skillsMapping(findUser.userId, parsedData.matchedSkills, parsedData.otherSkills);
            parsedData.matchedSkills = result.matchedSkillsArray;
            delete parsedData.otherSkills;
            parsedData.unmatchedSkills = result.unmatchedSkillsArray;

            if (!checkIfUserExists) {
              await educationDetailsMapping(findUser.userId, education);
              await workHistoryMapping(findUser.userId, experience);
            }

            await this.profileCompletionPercentageFunc(findUser.userId);

            userId = findUser ? findUser.userId : null;
            await userDreamJobs.findOrCreate({ where: { userId, jobId } });
            let findGoal = await jobGoals.findOne({ where: { jobId } });
            await userGoals.findOrCreate({ where: { userId, jobId, goalId: findGoal.goalId } });

            let resumeFilePath = `/resume_files/resumeFile_${userId}_${name.toLowerCase().replaceAll(" ", "")}.pdf`;
            let destinationPath = path.join(__dirname, `../resources${resumeFilePath}`);
            await fs.copyFileSync(filePath, destinationPath);

            let phoneNumberString = parsedData.candidate_summary?.phoneNumber;
            if (phoneNumberString) {
              const phoneRegex = /(?:\+91|91)?[-.\s]?(\d{10})/;

              const phoneMatch = phoneNumberString.match(phoneRegex);
              let countryCode = 91;
              let phoneNumber = null;
              if (phoneMatch) {
                phoneNumber = phoneMatch[1];
              }
              await users.update({ countryCode, phoneNumber }, { where: { userId } });
            }

            let { address = null, city = null, state = null, country = null, postalCode = null } = parsedData.candidate_summary?.location;
            studentDataUpdateObj = { resumeFilePath }
            if (address) {
              studentDataUpdateObj['address'] = address
            }
            if (city) {
              studentDataUpdateObj['city'] = city
            }
            if (state) {
              studentDataUpdateObj['state'] = state
            }
            if (country) {
              studentDataUpdateObj['country'] = country
            }
            if (postalCode) {
              studentDataUpdateObj['postalCode'] = postalCode
            }
            await students.update(studentDataUpdateObj, { where: { userId } });

            let jobSkillsCount = await jobSkills.count({ where: { jobId } });

            const matchedSkillsCount = await userJobSkills.count({
              where: {
                userId,
                jobId,
                resumeSkillLevel: {
                  [Sequelize.Op.not]: null,
                },
              },
            });

            let unmatchedSkillsCount = await userOtherSkills.count({ where: { userId } });

            const acquiredSkillsCount = await userJobSkills.count({
              where: {
                userId,
                jobId,
                resumeSkillLevel: {
                  [Sequelize.Op.gte]: 7,
                },
              },
            });

            const partiallyAcquiredSkillsCount = await userJobSkills.count({
              where: {
                userId,
                jobId,
                resumeSkillLevel: {
                  [Sequelize.Op.not]: null,
                  [Sequelize.Op.lt]: 7,
                },
              },
            });

            await userDreamJobs.update(
              {
                jobSkillsCount: jobSkillsCount,
                matchedSkillsCount: matchedSkillsCount,
                unmatchedSkillsCount: unmatchedSkillsCount,
                acquiredSkillsCount: acquiredSkillsCount,
                partiallyAcquiredSkillsCount: partiallyAcquiredSkillsCount
              },
              {
                where: {
                  userId, jobId
                }
              }
            );
          }
        }

        await resumeExtractions.create({
          jobId: jobId,
          userId: userId,
          email: email,
          resumeFileName: resumeFileName,
          rawData: resumeData,
          parsedData: parsedData
        });

        console.log(resumeFileName, ' - resume processing finished.'); //! TO BE REMOVED
      }
    }

    res.status(200).send('Finished');
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
};

exports.logViolationEvent = async (req, res, next) => {
  try {
    const userAssessmentId = parseInt(req.params.userAssessmentId, 10);

    const userAssessmentExists = await userAssessments.findOne({
      where: {
        userAssessmentId
      },
      raw: true,
    });

    if(!userAssessmentExists) {
      return res.status(404).json({ status: false, message: "User assessment not found." });
    }

    if(userAssessmentExists?.userId !== req.userId) {
      return res.status(401).json({ status: false, message: "Assessment not linked to this user." });
    }

    // if(userAssessmentExists?.assessmentStatus !== "IN_PROGRESS") {
    //   return res.status(400).json({ status: false, message: `Assessment no longer in progress. Assessment Status: ${userAssessmentExists.assessmentStatus}` });
    // }

    const validViolations = ['IP_VIOLATION', 'FULL_SCREEN_VIOLATION', 'TAB_CHANGE_VIOLATION', 'COPY_PASTE_VIOLATION', 'MOUSE_OUT_VIOLATION'];

    let { events } = req.body;

    const addedViolations = [], skippedViolations = [];

    events.forEach(event => {
      let { timestamp, eventName } = event;
      const trimmedEventName = eventName.trim();

      if(validViolations.includes(trimmedEventName)) {
        if(timestamp === null) {
          addedViolations.push({userAssessmentId, trimmedEventName});
          return ;
        }
        timestamp = new Date(timestamp);
        if (isNaN(timestamp.getTime())) {
          addedViolations.push({userAssessmentId, trimmedEventName});
        } else {
          addedViolations.push({userAssessmentId, trimmedEventName, timestamp});
        }
      } else {
        skippedViolations.push({userAssessmentId, eventName, timestamp});
      }
    });
    
    await userAssessmentViolations.bulkCreate(addedViolations);

    res.status(200).json({ status: true, message: "Violation(s) reported successfully.", addedViolations, skippedViolations });
  } catch (error) {
    console.error("Encountered an error while logging violation events: ", error);
    res.status(500).json({ status: false, message: "Something went wrong!" });
  }
};

exports.addSnapshotLink = async (req, res, next) => {
  try {
    const userAssessmentId = parseInt(req.params.userAssessmentId, 10);

    const userAssessmentExists = await userAssessments.findOne({
      where: {
        userAssessmentId
      },
      raw: true,
    });

    if(!userAssessmentExists) {
      return res.status(404).json({ status: false, message: "User assessment not found." });
    }

    if(userAssessmentExists?.userId !== req.userId) {
      return res.status(401).json({ status: false, message: "Assessment not linked to this user." });
    }

    // if(userAssessmentExists?.assessmentStatus !== "IN_PROGRESS") {
    //   return res.status(400).json({ status: false, message: `Assessment no longer in progress. Assessment Status: ${userAssessmentExists.assessmentStatus}` });
    // }

    const { snapshotLinks } = req.body;

    const addedSnapshots = [], skippedSnapshots = [];

    snapshotLinks.forEach(snapshotLink => {
      const trimmedSnapshotLink = snapshotLink.trim();

      if(trimmedSnapshotLink && trimmedSnapshotLink?.length) {
        addedSnapshots.push({userAssessmentId, snapshotLink: trimmedSnapshotLink});
      } else {
        skippedSnapshots.push({userAssessmentId, snapshotLink});
      }
    });

    await userAssessmentSnapshots.bulkCreate(addedSnapshots);

    res.status(200).json({ status: true, message: "Snapshot Link(s) saved successfully.", addedSnapshots, skippedSnapshots });
  } catch (error) {
    console.error("Encountered an error while saving snapshot link: ", error);
    res.status(500).json({ status: false, message: "Something went wrong!" });
  }
}

exports.getMyAssessments = async (req, res, next) => {
	try {
		let userId = req.userId;

		const { assessmentProvider, assessmentStatus, isActive = true } = req.query;
		let assessmentImageLink = process.env.API_HOST_URL + "assessment-logo.png";

		let query = `
			SELECT 
				ua.userAssessmentId, ua.assessmentName, "${assessmentImageLink}" AS assessmentThumbnail, 
				ua.assessmentProvider, ua.assessmentStatus, ua.totalQuestion, ua.totalScore, ua.totalTestTimeInSec, 
				od.orderId, od.orderDetailId, od.goalId, od.jobId, od.categoryId, od.subCategoryId, od.skillId, ua.amount,
        CASE WHEN od.skillId IS NOT NULL THEN 'Skill' WHEN od.jobId IS NOT NULL THEN 'Job Assessment' ELSE 'Roadmap Assessment' END AS assessmentType,
        JSON_ARRAYAGG(s.skillName) AS skillNames,
        CASE WHEN od.skillId IS NOT NULL THEN 'Skill' ELSE 'Full Module' END AS assessmentScope,
        COUNT(DISTINCT s.skillName) AS totalSkills
			FROM user_assessments ua
			JOIN order_details od ON od.orderDetailId = ua.orderDetailId
      LEFT JOIN skills s ON JSON_CONTAINS(ua.assessmentSkillIds, CAST(s.skillId AS JSON), '$')
			WHERE ua.userId = ${userId}
			${assessmentProvider ? `AND ua.assessmentProvider = :assessmentProvider` : ''}
			${isActive == 'true' ? `
				AND ua.assessmentStatus IN ('ENROLLED', 'INVITED', 'IN_PROGRESS')
			` : `
				AND ua.assessmentStatus IN ('COMPLETED', 'DISQUALIFIED', 'REJECTED')
			`}
      GROUP BY ua.userAssessmentId;
		`
		const userAssessmentsData = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: { assessmentProvider }
		});

		return res.status(200).json({ status: true, data: userAssessmentsData });
	} catch (error) {
		console.error("Encountered an error while fetching user assessments: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
}

exports.getAssessmentById = async (req, res, next) => {
	try {
		let userId = req.userId;

		const { userAssessmentId } = req.params;
		let assessmentImageLink = process.env.API_HOST_URL + "assessment-logo.png";

    let query = `
			SELECT 
				ua.userAssessmentId, ua.assessmentName, "${assessmentImageLink}" AS assessmentThumbnail, 
				ua.assessmentProvider, ua.assessmentStatus, ua.totalQuestion, ua.totalScore, ua.totalTestTimeInSec, 
				od.orderId, od.orderDetailId, od.goalId, od.jobId, od.categoryId, od.subCategoryId, od.skillId, ua.amount,
        CASE WHEN od.skillId IS NOT NULL THEN 'Skill' WHEN od.jobId IS NOT NULL THEN 'Job Assessment' ELSE 'Roadmap Assessment' END AS assessmentType,
        JSON_ARRAYAGG(s.skillName) AS skillNames,
        CASE WHEN od.skillId IS NOT NULL THEN 'Skill' ELSE 'Full Module' END AS assessmentScope,
        COUNT(DISTINCT s.skillName) AS totalSkills
			FROM user_assessments ua
			JOIN order_details od ON od.orderDetailId = ua.orderDetailId
      LEFT JOIN skills s ON JSON_CONTAINS(ua.assessmentSkillIds, CAST(s.skillId AS JSON), '$')
			WHERE ua.userId = ${userId} AND ua.userAssessmentId = :userAssessmentId
      GROUP BY ua.userAssessmentId;
		`
		const userAssessmentsData = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: { userAssessmentId }
		});

		return res.status(200).json({ status: true, data: userAssessmentsData[0] || null });
	
	} catch (error) {
		console.error("Encountered an error while fetching user assessment by userAssessmentId: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
}

exports.getAssessmentQuestions = async (req, res, next) => {
	try {
		let userId = req.userId;
		const { userAssessmentId } = req.params;

		let assessmentImageLink = process.env.API_HOST_URL + "assessment-logo.png";

		let userAssessmentData = await userAssessments.findOne({ 
			where: { userId, userAssessmentId }, 
			attributes: ['userAssessmentId', 'assessmentName', 'assessmentProvider', 'assessmentStatus', 'totalQuestion', 'totalScore', 'totalTestTimeInSec', 'amount', 'assessmentStartedAt', 'assessmentSubmittedAt'] 
		})
		if (!userAssessmentData) {
			return res.status(404).json({ status: false, message: "User assessment not found." });
		}

		if (userAssessmentData.assessmentStatus == 'DISQUALIFIED' || userAssessmentData.assessmentStatus == 'REJECTED' || userAssessmentData.assessmentStatus == 'COMPLETED') {
			return res.status(400).json({ status: false, message: "User assessment has already been taken." });
		}

    const existingUserAssessment = await userAssessments.findOne({ where: { userId, assessmentStatus: 'IN_PROGRESS', assessmentProvider: "JCurve", userAssessmentId: { [Op.ne]: userAssessmentId } } });
    if (existingUserAssessment) {
      return res.status(400).json({ status: false, message: "User assessment already in progress." });
    }

		let query = `
			SELECT 
				q.questionId, q.question, q.optionA, q.optionB, q.optionC, q.optionD, 
				-- q.answer, 
				q.marks, q.questionType, uaq.userAnswer, uaq.questionStatus
			FROM user_assessment_questions uaq
			LEFT JOIN questions q ON q.questionId = uaq.questionId
			WHERE uaq.userId = ${userId} AND uaq.userAssessmentId = :userAssessmentId
		`
		const userAssessmentQuestions = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: { userAssessmentId }
		});

		userAssessmentData = userAssessmentData.toJSON()
		userAssessmentData.assessmentImageLink = assessmentImageLink;
		userAssessmentData.assessmentQuestionsCount = userAssessmentQuestions.length;
		userAssessmentData.assessmentQuestions = userAssessmentQuestions;

		let remainingTimeInSec = userAssessmentData.totalTestTimeInSec;
    const currentDateTime = new Date()

		if (userAssessmentData.assessmentStatus != 'IN_PROGRESS' || !userAssessmentData.assessmentStartedAt) {
			userAssessmentData.assessmentStatus = 'IN_PROGRESS';
			userAssessmentData.assessmentStartedAt = currentDateTime;
      let updateData = { assessmentStatus: 'IN_PROGRESS', assessmentStartedAt: currentDateTime }
			await userAssessments.update(updateData, { where: { userAssessmentId } });
		} else {
      const timeElapsed = Math.floor((currentDateTime - userAssessmentData.assessmentStartedAt) / 1000);
      remainingTimeInSec = remainingTimeInSec > timeElapsed ? remainingTime - timeElapsed : 0;
    }

		return res.status(200).json({ status: true, data: userAssessmentData, remainingTimeInSec });
	} catch (error) {
		console.error("Encountered an error while fetching user assessment questions: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
}

exports.updateAssessmentAnswers = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { userAssessmentId } = req.params;
    const { userAnswers, remainingTime } = req.body;

    if (!userAssessmentId || !Array.isArray(userAnswers) || userAnswers.length == 0) {
        return res.status(400).json({ status: false, message: "Invalid input parameters." });
    }

    let userAssessmentQuery = `
			SELECT ua.*, od.goalId, od.jobId, od.categoryId, od.subCategoryId, od.skillId
			FROM user_assessments ua
      JOIN  order_details od ON od.orderDetailId = ua.orderDetailId
			WHERE ua.userId = ${userId} and ua.userAssessmentId = ${userAssessmentId}
    `;
    const userAssessmentsData = await sequelize.query(userAssessmentQuery, {
      type: sequelize.QueryTypes.SELECT,
    });

    if (userAssessmentsData.length == 0 || !userAssessmentsData[0]) {
      return res.status(404).json({ status: false, message: "User assessment not found." });
    }
    let userAssessment = userAssessmentsData[0]

    if (userAssessment.assessmentStatus != 'IN_PROGRESS') {
      return res.status(400).json({ status: false, message: `Assessment no longer in progress. Assessment Status: ${userAssessment.assessmentStatus}` });
    }
    if (remainingTime > userAssessment.totalTestTimeInSec) {
      return res.status(400).json({ status: false, message: "Remaining time should not greater then Assessment Time." });
    }
    if (userAssessment.remainingTime != null && remainingTime > userAssessment.remainingTime) {
      return res.status(400).json({ status: false, data: "Remaining time should not greater then previous Time" });
    }

    let query = `
      SELECT uaq.*, sq.skillLevel, q.answer, q.marks, 
      CASE 
        WHEN sq.skillLevel = 5 THEN 'BEGINNER' 
        WHEN sq.skillLevel = 7 THEN 'INTERMEDIATE' 
        WHEN sq.skillLevel = 9 THEN 'ADVANCED' 
        ELSE NULL 
      END AS skillLevelLabel

      FROM user_assessment_questions uaq
      LEFT JOIN skill_questions sq ON uaq.questionId = sq.questionId AND uaq.skillId = sq.skillId
      LEFT JOIN questions q ON uaq.questionId = q.questionId
      WHERE uaq.userAssessmentId = :userAssessmentId AND uaq.userId = :userId;
    `
    const userAssessmentQuestionsData = await sequelize.query(query, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { userAssessmentId, userId }
    });
    
    if (!userAssessmentQuestionsData || userAssessmentQuestionsData.length == 0) {
      return res.status(404).json({ status: false, message: "No questions found for this assessment." });
    }

    let userAssessmentQuestionsSkillIds = userAssessmentQuestionsData.map(assessment => assessment.skillId);
    userAssessmentQuestionsSkillIds = [...new Set(userAssessmentQuestionsSkillIds)];

    let skillQuestionCounts = {};
    userAssessmentQuestionsData.forEach(({ skillId }) => {
      skillQuestionCounts[skillId] = (skillQuestionCounts[skillId] || 0) + 1;
    });

    const createUserAssessmentSkillWiseResults = userAssessmentQuestionsSkillIds.map(skillId => ({
      userId,
      userAssessmentId,
      skillId,
      totalQuestions: skillQuestionCounts[skillId] || 0,
      attemptedQuestions: 0,
      correctQuestions: 0,
      wrongQuestions: 0,
      percentage: 0
    }));

    let jobSkillsData = [];
    if (userAssessment.jobId) {
      const query = `
        SELECT 
          jobId, skillId, requiredSkillLevel,
          CASE 
            WHEN requiredSkillLevel = 5 THEN 'BEGINNER' 
            WHEN requiredSkillLevel = 7 THEN 'INTERMEDIATE' 
            WHEN requiredSkillLevel = 9 THEN 'ADVANCED' 
            ELSE 'UNKNOWN' 
          END AS skillLevelLabel
        FROM job_skills
        WHERE jobId = :jobId AND skillId IN (:skillIds)
      `;
      jobSkillsData = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { jobId: userAssessment.jobId, skillIds: userAssessmentQuestionsSkillIds }
      });
    }

    const updatePromises = [];
    const userSkillLevelsPromises = [];
    const userJobSkillsPromises = [];

    let nonExistingIds = [];

    let totalScoreAchieved = 0;
    let totalScore = userAssessment.totalScore;

    let userSkillLevelData = [] // { skillId, skillLevelLabel, totalScore, totalScoreAchieved }
    let userJobSkillLevelData = []
    for (let userAnswer of userAnswers) {
      const { questionId, answer } = userAnswer;
    
      const assessment = userAssessmentQuestionsData.find(assessment => assessment.questionId == questionId);
      if (!assessment) {
        nonExistingIds.push(questionId);
      } else {
        let isCorrect = assessment.answer == answer;
        let score = isCorrect ? assessment.marks : 0;
        totalScoreAchieved += score;

        updatePromises.push(
          userAssessmentQuestions.update({ userAnswer: answer, isCorrect, score, questionStatus: 'Attempted' }, { where: { userAssessmentId, userId, questionId } })
        )

        let userAssessmentSkillResults =  createUserAssessmentSkillWiseResults.find(assessmentResult => assessmentResult.skillId == assessment.skillId);
        userAssessmentSkillResults.attemptedQuestions += 1;
        userAssessmentSkillResults.correctQuestions += isCorrect ? 1 : 0;
        userAssessmentSkillResults.wrongQuestions = userAssessmentSkillResults.totalQuestions - userAssessmentSkillResults.correctQuestions;
        userAssessmentSkillResults.percentage = userAssessmentSkillResults.totalQuestions ? (userAssessmentSkillResults.correctQuestions / userAssessmentSkillResults.totalQuestions) * 10 : 0;

        if (!userAssessment.skillId && assessment.skillLevelLabel) {
          let userSkillLevel = userSkillLevelData.find(skill => skill.skillId == assessment.skillId && skill.skillLevelLabel == assessment.skillLevelLabel);

          if (userSkillLevel) {
              userSkillLevel.totalScoreAchieved += score;
          } else {
            const totalScore = userAssessmentQuestionsData.filter(item => item.skillId == assessment.skillId && item.skillLevelLabel == assessment.skillLevelLabel).reduce((sum, item) => sum + (item.marks || 0), 0);
            userSkillLevelData.push({
              skillId: assessment.skillId,
              skillLevelLabel: assessment.skillLevelLabel,
              totalScore: totalScore,
              totalScoreAchieved: score
            });
          }
        }

        if (!userAssessment.skillId && userAssessment.jobId) {
          let jobSkill = jobSkillsData.find(skill => skill.skillId == assessment.skillId && skill.skillLevelLabel == assessment.skillLevelLabel);
          if (jobSkill) {
            let userSkillLevel = userJobSkillLevelData.find(skill => skill.skillId == assessment.skillId && skill.skillLevelLabel == jobSkill.skillLevelLabel);
            if (userSkillLevel) {
              userSkillLevel.totalScoreAchieved += score;
            } else {
              const totalScore = userAssessmentQuestionsData.filter(item => item.skillId == assessment.skillId && item.skillLevelLabel == jobSkill.skillLevelLabel).reduce((sum, item) => sum + (item.marks || 0), 0);
              userJobSkillLevelData.push({
                skillId: assessment.skillId,
                skillLevelLabel: jobSkill.skillLevelLabel,
                totalScore: totalScore,
                totalScoreAchieved: score
              });
            }
          }
        }
      }
    }

    if (nonExistingIds.length > 0) {
      return res.status(404).json({
        status: false,
        message: `Question(s) with ID(s) ${nonExistingIds.join(', ')} not found.`,
      });
    }

    let totalTestElapsedTimeInSec = userAssessment.totalTestTimeInSec - remainingTime;
    let avgScorePercentage = totalScore ? (totalScoreAchieved / totalScore) * 10 : 0

    if (userAssessment.skillId) {
      let userSkillLevel = totalScore? (totalScoreAchieved / totalScore) * 10 : 0;
      const userSkillData = await userSkills.findOne({ where: { userId, skillId: userAssessment.skillId } })
      if (userSkillData) {
        if (userSkillData.acquiredLevel < userSkillLevel) {
          await userSkills.update({ acquiredLevel: userSkillLevel }, { where: { userId, skillId: userAssessment.skillId } });
        }
      } else {
        await userSkills.create({ userId, skillId: userAssessment.skillId, acquiredLevel: userSkillLevel });
      }
    } else if (userSkillLevelData && userSkillLevelData.length > 0) {
      const whereConditions = {
        userId,
        [Op.or]: userSkillLevelData.map(({ skillId, skillLevelLabel }) => ({
          skillId,
          level: skillLevelLabel
        }))
      };
      const userSkillLevelRecords = await userSkillLevels.findAll({ where: whereConditions });

      for (let userSkillLevel of userSkillLevelData) {
        let userSkillLevelRecord = userSkillLevelRecords.find(skill => skill.skillId == userSkillLevel.skillId && skill.level == userSkillLevel.skillLevelLabel);
        const acquiredLevel = (userSkillLevel.totalScoreAchieved / userSkillLevel.totalScore) * 10;

        if (userSkillLevelRecord) {
          if (userSkillLevelRecord.acquiredLevel < acquiredLevel) {
            userSkillLevelsPromises.push(
              userSkillLevels.update({ acquiredLevel }, { where: { userId, skillId: userSkillLevel.skillId, level: userSkillLevel.skillLevelLabel } })
            )
          }
        } else {
          userSkillLevelsPromises.push(
            userSkillLevels.create({ userId, skillId: userSkillLevel.skillId, level: userSkillLevel.skillLevelLabel, acquiredLevel })
          )
        }
      }

      const userJobSkillsData = await userJobSkills.findAll({ where: { userId, jobId: userAssessment.jobId, skillId: { [Op.in]: userAssessmentQuestionsSkillIds } } });
      for (let userJobSkillLevel of userJobSkillLevelData) {
        let userJobSkillLevelRecord = userJobSkillsData.find(skill => skill.skillId == userJobSkillLevel.skillId);
        const acquiredLevel = (userJobSkillLevel.totalScoreAchieved / userJobSkillLevel.totalScore) * 10;

        if (userJobSkillLevelRecord) {
          if (userJobSkillLevelRecord.acquiredLevel < acquiredLevel) {
            userJobSkillsPromises.push(
              userJobSkills.update({ acquiredLevel }, { where: { userId, jobId: userAssessment.jobId, skillId: userJobSkillLevel.skillId } })
            )
          }
        } else {
          userJobSkillsPromises.push(
            userJobSkills.create({ userId, jobId: userAssessment.jobId, skillId: userJobSkillLevel.skillId, acquiredLevel })
          )
        }
      }
    }

    await userAssessmentSkillWiseResults.bulkCreate(createUserAssessmentSkillWiseResults);
    await Promise.all(updatePromises);
    await userAssessments.update({ totalScoreAchieved, avgScorePercentage, remainingTime, totalTestElapsedTimeInSec, assessmentStatus: "COMPLETED", assessmentSubmittedAt: new Date() }, { where: { userAssessmentId } })

    res.status(200).json({ status: true, message: "Assessment answers updated successfully." });
    this.generateAssessmentReport(userAssessmentId)
  } catch (error) {
      console.error("Error updating assessment answers:", error);
      return res.status(500).json({ status: false, message: "Something went wrong." });
  }
};

exports.updateAssessmentRemainingTime = async (req, res, next) => {
  try {
    const userAssessmentId = parseInt(req.params.userAssessmentId, 10);

    const userAssessmentExists = await userAssessments.findOne({ where: { userAssessmentId } });

    if(!userAssessmentExists) {
      return res.status(404).json({ status: false, message: "User assessment not found." });
    }
    
    if(userAssessmentExists?.userId !== req.userId) {
      return res.status(401).json({ status: false, message: "Assessment not linked to this user." });
    }

    if(userAssessmentExists?.assessmentStatus !== "IN_PROGRESS") {
      return res.status(400).json({ status: false, message: `Assessment no longer in progress. Assessment Status: ${userAssessmentExists.assessmentStatus}` });
    }

    const { remainingTime } = req.body;

    if (remainingTime > userAssessmentExists.totalTestTimeInSec) {
      return res.status(400).json({ status: false, message: "Remaining time should not greater then Assessment Time." });
    }
    if (userAssessmentExists.remainingTime != null && remainingTime > userAssessmentExists.remainingTime) {
      return res.status(400).json({ status: false, data: "Remaining time should not greater then previous Time" });
    }

    await userAssessments.update({ remainingTime }, { where: { userAssessmentId } });

    res.status(200).json({ status: true, message: "Assessment remaining time updated successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Something went wrong!" });
  }
}

exports.generateAssessmentReport = async (userAssessmentId) => {
  try {
    const puppeteer = require('puppeteer');
    const ejs = require('ejs');

    let assessmentDataQuery = `
      SELECT
        CONCAT(s.firstName, ' ', s.lastName) AS candidateName,
        u.email AS candidateEmail,
        ua.assessmentName AS assessmentTitle,
        DATE(ua.assessmentStartedAt) AS assessmentDate,
        ua.assessmentSubmittedAt AS assessmentCompletedAt,
        ua.totalQuestion AS totalQuestions,
        ua.totalScore,
        ua.totalScoreAchieved AS candidateScore,
        ua.avgScorePercentage AS scorePercent,
        ua.assessmentStatus
      FROM user_assessments ua
      JOIN users u ON u.userId = ua.userId
      JOIN students s ON s.userId = ua.userId
      WHERE
        ua.userAssessmentId = ${userAssessmentId}
    `;
    const assessmentData = await sequelize.query(assessmentDataQuery, { type: sequelize.QueryTypes.SELECT });

    let questionsDataQuery = `
      SELECT
        q.questionId, q.questionType, q.question, q.optionA, q.optionB, q.optionC, q.optionD, q.answer, uaq.userAnswer, q.marks
      FROM user_assessment_questions uaq
      LEFT JOIN questions q ON q.questionId = uaq.questionId
      WHERE
        uaq.userAssessmentId = ${userAssessmentId}
    `;
    const questionsData = await sequelize.query(questionsDataQuery, { type: sequelize.QueryTypes.SELECT });

    let violationsQuery = `
      SELECT
        eventName, COUNT(userAssessmentViolationId) AS violationCount
      FROM jcurve_db.user_assessment_violations
      WHERE userAssessmentId = ${userAssessmentId}
      GROUP BY eventName
    `;
    const violationsData = await sequelize.query(violationsQuery, { type: sequelize.QueryTypes.SELECT });

    var renderData = {
      "jcurveLogo": `${process.env.API_HOST_URL}logo.png`,
      "candidateName": assessmentData[0].candidateName,
      "candidateEmail": assessmentData[0].candidateEmail,
      "assessmentTitle": assessmentData[0].assessmentTitle,
      "assessmentDate": moment(assessmentData[0].assessmentDate).format("DD-MMM-YYYY"),
      "assessmentCompletedAt": moment(assessmentData[0].assessmentCompletedAt).format("DD-MMM-YYYY h:mm A"),
      "totalQuestions": assessmentData[0].totalQuestions,
      "totalScore": assessmentData[0].totalScore,
      "candidateScore": assessmentData[0].candidateScore,
      "scorePercent": assessmentData[0].scorePercent,
      "assessmentStatus": assessmentData[0].assessmentStatus,
      "questions": questionsData,
      "violationsData": violationsData
    };

    // Generate unique filename with timestamp
    const fileName = `${renderData.assessmentTitle}_Assessment_Report_${Date.now()}.pdf`;

    // Render HTML template with data
    const htmlContent = await ejs.renderFile(path.join(__dirname, '../views/assessmentReport.ejs'), renderData);

    // Launch browser and create new page
    const browser = await puppeteer.launch({
      executablePath: require('puppeteer').executablePath(),
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    // Set content and wait for everything to load
    await page.setContent(htmlContent, {
      waitUntil: ['load', 'domcontentloaded', 'networkidle0']
    });

    // Configure page for PDF generation
    await page.emulateMediaType('screen');

    // Generate PDF with header and footer
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="width: 100%; padding: 10px 20px; font-size: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <img src="data:image/png;base64,${Buffer.from(fs.readFileSync('./resources/logo.png')).toString('base64')}" alt="Logo" width="80">
            <div style="margin-top: 5px;">
              <span>${renderData.assessmentTitle} Assessment Report</span>
            </div>
          </div>
          <div style="text-align: right;">
            <p style="font-size: 12px; font-weight: bold; margin: 0;">${renderData.candidateName}</p>
            <div style="margin-top: 5px;">
              <span>${renderData.assessmentDate}</span>
            </div>
          </div>
        </div>
      `,
      footerTemplate: `
        <div style="width: 100%; padding: 10px 20px; font-size: 10px;">
          <div style="float: left;">&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</div>
          <div style="float: right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
        </div>
      `,
      margin: {
        top: '80px',
        bottom: '60px'
      }
    });

    await browser.close();

    await fs.writeFileSync(`./resources/assessment_candidate_reports/${fileName}`, pdf);

    userAssessments.update(
      {
        assessmentReport: `${process.env.API_HOST_URL}assessment_candidate_reports/${fileName}`
      },
      { where: { userAssessmentId } }
    );
  } catch (error) {
    console.log(error);
  }
}