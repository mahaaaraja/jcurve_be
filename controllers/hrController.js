const axios = require("axios");
// const curriculums = require("../models/curriculums");
const courses = require("../models/courses");
// const materials = require("../models/materials");
const skills = require("../models/skills");
const goals = require("../models/goals");
const { jobs, jobFacilities } = require("../models/jobs");
// const goalRoadmap = require("../models/goalRoadmap");
// const jobCourses = require("../models/jobCourses");
const slugify = require('slugify');
const sequelize = require('../util/dbConnection');
const hrModel = require("../models/hrManagers")
const jobModel = require("../models/jobs.js")
const usersModel = require("../models/users")
const studentsModel = require("../models/students")
const studentExperiencesModel = require("../models/studentExperiences")
// const jobCoursesModel = require("../models/jobCourses")
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const fs = require('fs')
const pdf = require("pdf-parse");
const path = require('path');
const mammoth = require('mammoth');
const moment = require("moment");
const users = require("../models/users");
const students = require("../models/students");
const { Op, QueryTypes, Sequelize, where } = require("sequelize");
const userJobStatus = require("../models/userJobStatus.js");
const studentController = require("./studentController.js");
const partners = require('../models/partners.js');
const userAuthTokens = require('../models/userAuthTokens.js');

const jwtTokens = require('../util/jwtTokens.js');
const userRoles = require("../models/userRoles.js");
const roles = require("../models/roles.js");
const facilityMasters = require("../models/facilityMasters.js");
const recruiterRegistrations = require("../models/recruiterRegistrations.js");
const sendMailer = require('../util/nodeMailer');
// const verifyMailTokenModel = require("../models/verifyMailTokens.js");
const authController = require("./authController.js");
const userPartnerCodes = require("../models/userPartnerCodes.js");
const { type } = require("os");
const categories = require("../models/categories.js");
const subCategories = require("../models/subCategories.js");
const categorySubCategories = require("../models/categorySubCategories.js");
const subCategorySkills = require("../models/subCategorySkills.js");
const jobSkills = require("../models/jobSkills.js");
const userJobSkills = require("../models/userJobSkills.js");
const goalRoadmaps = require("../models/goalRoadmaps.js");
const jobGoals = require("../models/jobGoals.js");
const userSkills = require("../models/userSkills.js");
const userGoals = require("../models/userGoals.js");
const userJobMetrics = require("../models/userJobMetrics.js");
const hrCandidateJobComments = require("../models/hrCandidateJobComments.js");
const hrExportConfigs = require("../models/hrExportConfigs.js");
const hrJResumeExportConfigs = require("../models/hrJResumeExportConfigs.js");
const userJobStatusTracking = require("../models/userJobStatusTracking");
const { paginateResults } = require("../util/pagination.js");
const partnerOverallMetrics = require("../models/partnerOverallMetrics.js");
const partnerJobMetrics = require("../models/partnerJobMetrics.js");

moment.tz.setDefault("Asia/Calcutta");

const generateUniqueId = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hr Portal Auth API Controllers

exports.hrSignup = async (req, res, next) => {
	try {
		const { firstName, lastName, email, password, partnerCode } = req.body;

		// const url = (req.headers.origin || req.headers.referer || "").replace(/\/$/, "");
		// if (!url) {
		//     return res.status(500).json({ status: false, message: 'Error fetching URL.' });
		// }

		const partnerExists = await partners.findOne({ where: { partnerCode } });
		if (!partnerExists) {
			return res.status(404).json({ status: false, message: 'Partner not found for the provided URL.' });
		}

		let hrRoleName = "HR"
		const hrRole = await roles.findOne({ where: { roleName: hrRoleName } });
		if (!hrRole) {
			return res.status(404).json({ status: false, message: `${hrRoleName} role not found.` });
		}

		const userExists = await users.findOne({ where: { email } });
		if (userExists) {
			const hrExists = await hrModel.findOne({ where: { userId: userExists.userId } });
			if (!hrExists) {
				await hrModel.create({ userId: userExists.userId, companyName: partnerExists.partnerName, firstName, lastName });
			}

			const hrRoleAssigned = await userRoles.findOne({ where: { userId: userExists.userId, roleId: hrRole.roleId } });
			const userExistsInPortal = await userPartnerCodes.findOne({ where: { userId: userExists.userId, partnerCode: partnerExists.partnerCode } });

			if (hrRoleAssigned) {
				if (userExistsInPortal) {
					return res.status(409).json({ status: false, message: 'User already exists. Please log in.' });
				} else {
					await userPartnerCodes.create({ userId: userExists.userId, partnerCode: partnerExists.partnerCode });
					return res.status(200).json({ status: true, message: 'User successfully registered with the new portal.' });
				}
			} else {
				await userRoles.create({ userId: userExists.userId, roleId: hrRole.roleId });
				if (userExistsInPortal) {
					return res.status(200).json({ status: true, message: `${hrRoleName} role assigned successfully.` });
				} else {
					await userPartnerCodes.create({ userId: userExists.userId, partnerCode: partnerExists.partnerCode });
					return res.status(200).json({ status: true, message: `${hrRoleName} role and portal assigned successfully.` });
				}
			}
		}

		// email validation and verification?

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		let uniqueId = null;
		let existingUser = null;
		do {
			uniqueId = generateUniqueId();
			uniqueId = `JC${uniqueId}`;
			existingUser = await users.findOne({ where: { uniqueId } });
		} while (existingUser);
		const secondaryEmail = `${uniqueId}@jcurve.tech`;

		const newUser = await users.create({ email, password: hashedPassword, isVerified: 1, uniqueId, secondaryEmail });
		if (newUser) {
			await hrModel.create({ userId: newUser.userId, companyName: partnerExists.partnerName, firstName, lastName });
			await userRoles.create({ userId: newUser.userId, roleId: hrRole.roleId });
			await userPartnerCodes.create({ userId: newUser.userId, partnerCode: partnerExists.partnerCode });
		}

		res.status(200).json({ status: true, message: `Registration successful. ${hrRoleName} account created and email sent.` });

		const mailBody = `
			<html>
				<head></head>
				<body>
					<div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
						<img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
						<div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
							<p>Dear ${firstName},<p>
							<p>Congratulations! Your registration with JCurve has been successfully completed. We're excited to have you on board.</p>
							<p>You can now log in and explore all the features we have to offer. If you have any questions or need assistance, feel free to reach out to our support team.</p>
							<p>Welcome to the JCurve community!</p>

							<p>Best regards,</p>
							<p>The JCurve Team.</p>
						</div>
						<p><small>© ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
					</div>
				</body>
			</html>`;
		const subject = 'Welcome to JCurve - Registration Successful!';

		await sendMailer.sendMail(email, subject, mailBody);
	} catch (error) {
		console.error("Encountered an error while signing up HR: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.hrLogin = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		const checkUser = await users.findOne({ where: { email } });
		if (!checkUser) {
			return res.status(404).json({ status: false, message: "Invalid Credentials. Please try again." });
		}

		if (!checkUser.password) {
			return res.status(404).json({ status: false, message: "Invalid Credentials. Please try again" });
		}

		const passwordMatch = await bcrypt.compare(password, checkUser.password);

		if (!passwordMatch) {
			return res.status(404).json({ status: false, message: "Invalid Credentials. Please try again" });
		}

		if (!checkUser.isActive) {
			return res.status(403).json({ success: false, message: 'User account inactive, can not proceed with login.' })
		}

		const hrRole = await roles.findOne({
			where: { roleName: "HR" }
		});

		const userRoleExists = await userRoles.findOne({
			where: {
				userId: checkUser.userId,
				roleId: hrRole.roleId
			}
		});

		if (!userRoleExists) {
			return res.status(401).json({ status: false, message: "Unauthorized Access. No HR account with the given credentials found." });
		}

		// const studentDetails = await students.findOne({ where: { userId: checkUser.userId } });
		// if (!studentDetails) {
		//     return res.status(404).json({ status: false, message: "Student data not found." });
		// }

		const hrData = await hrModel.findOne({
			where: {
				userId: checkUser.dataValues.userId,
			}
		});

		if (!hrData) {
			return res.status(404).json({ status: false, message: "No HR account with given credentials found!" });
		}

		const userPartnerCodeData = await userPartnerCodes.findOne({
			where: {
				userId: checkUser.dataValues.userId
			},
			order: [['createdAt', 'DESC']],
			limit: 1
		})

		if (!userPartnerCodeData) {
			return res.status(404).json({ status: true, message: "No partner code linked to HR." });
		}

		let userData = {
			userId: checkUser.dataValues.userId,
			firstName: hrData.dataValues.firstName,
			lastName: hrData.dataValues.lastName,
			email: checkUser.dataValues.email,
			partnerCode: userPartnerCodeData.dataValues.partnerCode,
			profilePicture: checkUser.dataValues.profilePicture ? (process.env.API_HOST_URL + checkUser.dataValues.profilePicture) : null
		}

		const accessToken = await jwtTokens.generateToken({ userId: checkUser.userId }, "30 days", process.env.ACCESS_TOKEN_SECRET);
		userData['accessToken'] = accessToken;

		let checkAuthRecord = await userAuthTokens.findOne({ where: { userId: checkUser.userId } });
		if (checkAuthRecord) {
			await userAuthTokens.update({ token: accessToken }, { where: { id: checkAuthRecord.id } });
		} else {
			await userAuthTokens.create({ userId: checkUser.userId, token: accessToken });
		}

		res.status(200).json({ status: true, message: "You are successfully logged in", data: userData });

	} catch (error) {
		console.error("Encountered an error while logging in HR: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.hrLogout = async (req, res, next) => {
	try {
		const userId = req.userId;
		if (!userId) {
			return res.status(400).json({ status: false, message: "User ID is missing." });
		}

		const user = await usersModel.findOne({ where: { userId } });
		if (!user) {
			return res.status(400).json({ status: false, message: "User Not Found." });
		}

		const hrRole = await roles.findOne({ where: { roleName: "HR" } });
		const userRole = await userRoles.findOne({ where: { userId, roleId: hrRole.roleId } });
		if (!userRole) {
			return res.status(400).json({ status: false, message: 'User not assigned HR role.' });
		}

		await userAuthTokens.update({ token: null }, { where: { userId } });

		res.status(200).json({ status: true, message: 'Logged out successfully' });
	} catch (error) {
		console.error("Encountered an error while logging out HR: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

// Hr Portal Main API Controllers
exports.recruitmentMetrics = async (req, res, next) => {
	try {
		const { partnerCode } = req.query;

		let replacements = {};

		let goalsCondition = { isActive: true };

		const studentRole = await roles.findOne({ where: { roleName: "Student" } });

		// query to get job registrations under a partnerCode
		// finding the number of students having a given partnerCode
		let query = `
			SELECT
				count(ug.userId) AS jobRegistrationsCount,
				SUM(CASE WHEN careerGap.careerGap = 1 THEN 1 ELSE 0 END) AS candidatesWithCareerGap
			FROM user_goals ug
			JOIN jobs j ON j.jobId = ug.jobId
				LEFT JOIN (
					SELECT userId, IF(userId, 1, 0) as careerGap FROM student_experiences
					GROUP BY userId
					HAVING
						MAX(endDate) < DATE_SUB(CURDATE(), INTERVAL 9 MONTH)
						AND COUNT(endDate) = COUNT(*)
				) careerGap ON careerGap.userId = ug.userId`;
		
		if (partnerCode) {
			query += ` AND j.partnerCode = "${partnerCode}"`;
		}
			
		query += ` 
			JOIN users u ON u.userId = ug.userId AND u.isActive = true
			JOIN user_roles ur ON ur.userId = ug.userId AND ur.roleId = ${studentRole.roleId}
			JOIN user_partner_codes upc ON upc.userId = ug.userId`
		;

		if (partnerCode) {
			query += ` AND upc.partnerCode = "${partnerCode}"`;
		}

		const jobRegistrations = await sequelize.query(query, { type: QueryTypes.SELECT });

		// query to get shortlisted candidates count
		query = `
			SELECT COUNT(DISTINCT ujs.userId) AS shortlistedCandidatesCount FROM user_job_status ujs
			JOIN user_partner_codes upc ON upc.userId = ujs.userId
			JOIN user_roles ur ON ur.userId = upc.userId AND ur.roleId = ${studentRole.roleId} 
			WHERE ujs.isShortlisted = 1`
		;

		if (partnerCode) {
			query += ` AND upc.partnerCode = "${partnerCode}"`;
		}

		const candidatesShortlisted = await sequelize.query(query, {
			type: QueryTypes.SELECT,
			replacements
		});

		// const qualifiedCandidates = await this.getAllCandidatesByStatus(partnerCode, true);
		// const uniqueUserIds = [...new Set(qualifiedCandidates?.data?.map(candidate => candidate.userId))];

		let data = [
			{
				metricName: "Total Registered Candidates",
				count: jobRegistrations[0].jobRegistrationsCount
			},
			{
				metricName: "Returning to Work (RTW)",
				count: jobRegistrations[0].candidatesWithCareerGap
			},
			{
				metricName: "Shortlisted Candidates",
				count: candidatesShortlisted[0].shortlistedCandidatesCount
			},
			{
				metricName: "Active Roadmap Count",
				count: await goals.count({ where: goalsCondition })
			},
			// {
			//     metricName: "Candidates Rejected",
			//     count: await userJobStatus.count({ distinct: true, col: 'userId', include: [{
			//         model: users,
			//         where: partnerCodeCondition,
			//         attributes: ["userId"]
			//     }],
			//     where: {isRejected: true } })
			// },
			// {
			//     metricName: "Qualified Candidates",
			//     count: null // uniqueUserIds.length
			// },
			// {
			//     metricName: "Candidates Hired",
			//     count: await userJobStatus.count({ distinct: true, col: 'userId', include: [{
			//         model: users,
			//         where: partnerCodeCondition,
			//         attributes: ["userId"]
			//     }],
			//     where: { isHired: true } })
			// },
		]

		res.status(200).json({ status: true, data: data });
	} catch (error) {
		console.error("Encountered an error while fetching recruitment metrics: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getAllCandidatesWithJobs = async (req, res, next) => {
	try {
		let { sortOrder = "userId", partnerCode, keyword, type, availability, outreachStatus} = req.query;
		let jobId = parseInt(req.params.jobId);

		type = parseInt(type);
		outreachStatus = parseInt(outreachStatus);

		const studentRole = await roles.findOne({ where: { roleName: "Student" } });

		if (!studentRole) {
			console.error("Student role not found.")
		}

		const replacements = {};

		let countQuery = `
			SELECT
				SUM(CASE WHEN userData.userId THEN 1 ELSE 0 END) AS totalRecords
			FROM (
				SELECT DISTINCT(u.userId)
				FROM user_goals ug
				JOIN jobs j ON ug.jobId = j.jobId AND j.isActive = true`
		; 
		

		let dataQuery = `
			SELECT 		
				ujs.jobStatusId, upc.partnerCode, s.userId, u.email, s.city, u.isActive, sp.currentSalary, sp.expectedSalary, sp.availability, sp.isRelocate, null AS earliestStartDate, sp.location AS preferedLocation, latest_experience.jobTitle AS currentJobTitle, latest_experience.companyName AS lastWorkingCompany, s.city AS currentJobLocation, latest_experience.endDate AS currentJobEndDate, j.jobId, j.jobTitle, j.jobLocation, j.partnerJobId, userAssessmentData.assessmentReport AS assessmentReportLink, userAssessmentData.assessmentStatus,
				CONCAT(s.firstName, " ", s.lastName) AS fullName,
				COALESCE(CONCAT(u.countryCode, u.phoneNumber), u.phoneNumber) AS contactInformation,
				CONCAT("${process.env.API_HOST_URL}", u.profilePicture) as profilePicture,
				CONCAT("${process.env.API_HOST_URL}", s.resumeFilePath) as userResume,
				CONCAT(s.city, ", ", s.state, ", ", s.country, ", ", s.postalCode) AS location,
				IFNULL(sp.outReach, 0) AS outReach,
				IF(userAssessmentData.userId, true, false) AS isAssessmentTaken,
				IFNULL(ujm.coreSkillPercent, 0) AS coreSkillPercent,
				IFNULL(ujm.avgTrainingTime, 0) AS avgTrainingTime,
				IFNULL(ujm.missingSkills, 0) AS missingSkills,
				IFNULL(ujm.unverifiedSkillsCount, 0) AS unverifiedSkillsCount,
				IFNULL(ujm.unverifiedSkillsCount, 0) AS coreSkills,
				IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0) AS unifiedVerifiedSkillMatchPercent,
				IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) AS unifiedUnverifiedSkillMatchPercent,
				IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) AS unifiedSkillMatchPercent,
				ROUND(IFNULL(ujm.userExperienceInMonths, 0) / 12, 1) AS experienceInYears,
				ROUND(IFNULL(ujm.jobExperienceInMonths, 0) / 12, 1) AS jobExperienceInYears,
				IFNULL(ujm.experienceMatchInPercentage, 0) AS experienceMatchInPercentage,
				IFNULL(s.careerGap, 0) AS isCareerGapOneYear,
				IFNULL(ujs.isShortlisted, false) AS isShortlisted,
				IFNULL(ujs.isHired, false) AS isHired
			FROM user_goals ug
			JOIN jobs j ON ug.jobId = j.jobId AND j.isActive = true`
		;
		
		if (partnerCode) {
			dataQuery += ` AND j.partnerCode = :partnerCode`;
			countQuery += ` AND j.partnerCode = :partnerCode`;
			replacements.partnerCode = partnerCode;
		}

		dataQuery += `
			JOIN users u ON ug.userId = u.userId AND u.isActive = true
			JOIN students s ON s.userId = u.userId`
		;

		countQuery += `
			JOIN users u ON ug.userId = u.userId AND u.isActive = true
			JOIN students s ON s.userId = u.userId`
		;

		if(studentRole) {
			dataQuery += `
				JOIN user_roles ur ON ur.userId = u.userId AND ur.roleId = ${studentRole.roleId}`
			;

			countQuery += `
				JOIN user_roles ur ON ur.userId = u.userId AND ur.roleId = ${studentRole.roleId}`
			;
		}

		dataQuery += `
			JOIN user_partner_codes upc ON upc.userId = u.userId`
		;

		countQuery += `
			JOIN user_partner_codes upc ON upc.userId = u.userId`
		;

		if (partnerCode) {
			dataQuery += ` AND upc.partnerCode = :partnerCode`;
			countQuery += ` AND upc.partnerCode = :partnerCode`;
		}

		countQuery += ` 
			LEFT JOIN student_preferences sp ON sp.userId = u.userId
			WHERE 1 = 1`
		;
		
		dataQuery += `
			LEFT JOIN user_job_status ujs ON ujs.jobId = j.jobId AND ujs.userId = u.userId
			LEFT JOIN (
				SELECT *
				FROM user_job_metrics
			) ujm ON ujm.userId = ug.userId AND ujm.jobId = ug.jobId
			LEFT JOIN student_preferences sp ON sp.userId = u.userId
			LEFT JOIN (
				SELECT se3.userId, se3.jobTitle, se3.location, se3.startDate, se3.endDate,
				CASE WHEN cm.companyName = 'Others' THEN se3.otherCompanyName ELSE cm.companyName END AS companyName
				FROM student_experiences se3
				LEFT JOIN companies_masters cm ON se3.companyId = cm.companyId
				WHERE se3.endDate IS NULL OR se3.startDate = (SELECT MAX(startDate) FROM student_experiences sub_se WHERE sub_se.userId = se3.userId)
				GROUP BY se3.userId
			) latest_experience ON latest_experience.userId = u.userId
			LEFT JOIN (
				SELECT
					ua.userId, ua.jobId, ua.userAssessmentId, ua.assessmentStatus, ua.assessmentReport
				FROM user_assessments ua
				WHERE ua.assessmentStatus IN ('DISQUALIFIED', 'REJECTED', 'COMPLETED') AND ua.assessmentType = 'preRoadmap' AND ua.assessmentFeeType = 'Sponsored'
				GROUP BY ua.userId, ua.jobId
			) userAssessmentData ON userAssessmentData.userId = u.userId AND userAssessmentData.jobId = j.jobId
			WHERE 1 = 1`
		;

		if (jobId) {
			jobId = parseInt(jobId);
			dataQuery += ` AND ug.jobId = :jobId`;
			countQuery += ` AND ug.jobId = :jobId`;
			replacements.jobId = jobId;
		}

		if(type >= 0) {
			dataQuery += ` AND IFNULL(s.careerGap, 0) = :type`;
			countQuery += ` AND IFNULL(s.careerGap, 0) = :type`;
			replacements.type = type;
		}

		if(availability) {
			dataQuery += ` AND sp.availability = :availability`;
			countQuery += ` AND sp.availability = :availability`;
			replacements.availability = availability;
		}

		if(outreachStatus >= 0) {
			dataQuery += ` AND IFNULL(sp.outReach, 0) = :outreachStatus`;
			countQuery += ` AND IFNULL(sp.outReach, 0) = :outreachStatus`;
			replacements.outreachStatus = outreachStatus;
		}

		if(keyword) {
			keyword = '%' + keyword + '%';
			dataQuery += ` AND CONCAT(s.firstName, " ", s.lastName) LIKE :keyword`;
			countQuery += ` AND CONCAT(s.firstName, " ", s.lastName) LIKE :keyword`;
			replacements.keyword = keyword;
		}

		dataQuery += `
			ORDER BY ujm.unverifiedSkillsCount DESC
		`;
		countQuery += `) AS userData;`;

		const {data, totalRecords, totalPages, currentPage, limit} = await paginateResults(req, countQuery, replacements, dataQuery, replacements);

		if(totalRecords) {
			return res.status(200).json({ status: true, data, totalRecords, totalPages, currentPage, limit });
		}
		
		res.status(200).json({status: true, data});
	} catch (error) {
		console.error('Error fetching all candidates:', error);
		res.status(500).json({ status: false, message: 'Something went wrong!' });
	}
};

exports.allCandidates = async (req, res, next) => {
	try {
		let { sortOrder = "userId", partnerCode, keyword, type, } = req.query;

		type = parseInt(type);

		const studentRole = await roles.findOne({ where: { roleName: "Student" } });

		if (!studentRole) {
			console.error("Student role not found.");
		}

		const replacements = {};

		let dataQuery = `
			SELECT DISTINCT
				upc.partnerCode, s.userId, u.email, s.city, u.profileCompletionPercent, u.isVerified, u.isActive,
				CONCAT(s.firstName, " ", s.lastName) AS fullName,
				CONCAT("${process.env.API_HOST_URL}", u.profilePicture) as profilePicture,
				CONCAT(s.city, ", ", s.state, ", ", s.country, ", ", s.postalCode) AS location,
				ROUND(IFNULL(ujm.userExperienceInMonths, 0) / 12, 1) AS experienceInYears,
				IFNULL(s.careerGap, 0) AS isCareerGapOneYear
			FROM user_goals ug
			JOIN users u ON ug.userId = u.userId
			JOIN students s ON s.userId = u.userId
		`;

		let countQuery = `
			SELECT
				SUM(CASE WHEN userData.userId THEN 1 ELSE 0 END) AS totalRecords
			FROM (
				SELECT DISTINCT(u.userId)
				FROM user_goals ug
				JOIN users u ON ug.userId = u.userId
				JOIN students s ON s.userId = u.userId
		`;

		if(studentRole) {
			dataQuery += `
				JOIN user_roles ur ON ur.userId = u.userId AND ur.roleId = ${studentRole.roleId}
			`;

			countQuery += `
				JOIN user_roles ur ON ur.userId = u.userId AND ur.roleId = ${studentRole.roleId}
			`
		}

		dataQuery += `
			JOIN user_partner_codes upc ON upc.userId = u.userId
			LEFT JOIN (
				SELECT *
				FROM user_job_metrics
			) ujm ON ujm.userId = ug.userId AND ujm.jobId = ug.jobId
			WHERE u.isActive = true
		`;

		countQuery += `
			JOIN user_partner_codes upc ON upc.userId = u.userId
			WHERE u.isActive = true
		`;

		if (partnerCode) {
			dataQuery += ` AND upc.partnerCode = :partnerCode`;
			countQuery += ` AND upc.partnerCode = :partnerCode`;
			replacements.partnerCode = partnerCode;
		}

		if(type >= 0) {
			dataQuery += ` AND IFNULL(s.careerGap, 0) = :type`;
			countQuery += ` AND IFNULL(s.careerGap, 0) = :type`;
			replacements.type = type;
		}

		if(keyword) {
			keyword = '%' + keyword + '%';
			dataQuery += ` AND CONCAT(s.firstName, " ", s.lastName) LIKE :keyword`;
			countQuery += ` AND CONCAT(s.firstName, " ", s.lastName) LIKE :keyword`;
			replacements.keyword = keyword;
		}

		dataQuery += ` ORDER BY :sortOrder`;
		replacements.sortOrder = sortOrder;

		countQuery += `) AS userData;`;

		const {data, totalRecords, totalPages, currentPage, limit} = await paginateResults(req, countQuery, replacements, dataQuery, replacements);

		if(totalRecords) {
			return res.status(200).json({status: true, data, totalRecords, totalPages, currentPage, limit});
		}

		res.status(200).json({ status: true, data });
	} catch (error) {
		console.error('Error fetching all candidates:', error);
		res.status(500).json({ status: false, message: 'Something went wrong!' });
	}
};

exports.getJobsDropdownList = async (req, res, next) => {
	try {
		const { userId } = req.params;
		const { partnerCode } = req.query;

		let jobsQuery = `
		SELECT
			j.jobId, j.jobTitle, IF(ujs.userId, 1, 0) AS isShortlisted
		FROM user_goals ug
		LEFT JOIN jobs j ON j.jobId = ug.jobId
		LEFT JOIN user_job_status ujs ON ujs.userId = ${userId} AND ujs.jobId = j.jobId AND ujs.isShortlisted = 1 AND ujs.status = "SHORTLISTED"
		WHERE j.isActive = 1 AND ug.userId = ${userId}`;

		if (partnerCode) {
			jobsQuery += ` AND j.partnerCode = "${partnerCode}"`;
		}

		const jobsData = await sequelize.query(jobsQuery, { type: QueryTypes.SELECT });

		res.status(200).json({ status: true, data: jobsData });
	} catch (error) {
		console.error("Encountered an error while getting jobs dropdown list: ", error);
		res.status(500).json({ status: false, message: 'Something went wrong!' });
	}
}

exports.getAvailableJobs = async (req, res, next) => {
	try {
		const { partnerCode } = req.query;

		let whereCondition = { isActive: true }

		if (partnerCode) {
			whereCondition.partnerCode = partnerCode
		}

		const activeJobs = await jobs.findAll({
			where: whereCondition,
			attributes: ['jobId', 'jobTitle', 'jobLocation', 'partnerJobId', 'lastDateOfApply', 'createdAt']
		});

		let countsQuery = `
			SELECT
				ug.jobId,
				COUNT(ug.userId) AS userCount,
				SUM(CASE WHEN s.careerGap = 1 THEN 1 ELSE 0 END) AS candidatesWithCareerGap
			FROM user_goals ug
			JOIN jobs j ON j.jobId = ug.jobId
			JOIN users u ON u.userId = ug.userId AND u.isActive = true
			JOIN students s ON s.userId = u.userId
			JOIN user_partner_codes upc ON upc.userId = ug.userId
		`;

		if (partnerCode) {
			countsQuery += ` AND j.partnerCode = "${partnerCode}" AND upc.partnerCode = "${partnerCode}"`;
		}

		countsQuery += `
			GROUP BY ug.jobId
		`;

		const candidatesAvailable = await sequelize.query(countsQuery, { type: QueryTypes.SELECT });

		const updatedActiveJobs = activeJobs.map(job => {
			const matchingCount = candidatesAvailable.find(count => count.jobId == job.jobId);
			return {
				...job.dataValues,
				candidatesAvailable: matchingCount ? matchingCount.userCount : 0,
				rtwCandidatesCount: matchingCount ? matchingCount.candidatesWithCareerGap : 0
			};
		});

		res.status(200).json({ status: true, activeJobs: updatedActiveJobs });
	} catch (error) {
		console.error("Encountered an error while fetching available jobs: ", error);
		return res.status(400).json({ status: false, message: "Something went wrong!" });
	}
};

exports.recommendedCandidates = async (req, res, next) => {
	try {
		const { jobId } = req.params;
		const { sortOrder = "userId", partnerCode } = req.query;

		// const result = await this.getCandidatesByJobId(partnerCode, jobId, sortOrder, false);
		const result = await this.getAllCandidatesByStatus(partnerCode, true, sortOrder, true, false, jobId);
		let dataFormate = result.data ? { data: result.data } : { message: result.message };

		res.status(result.status).json({ status: result.status == 200, ...dataFormate });
	} catch (error) {
		console.error('Error fetching recommended candidates:', error);
		res.status(500).json({ status: false, message: 'Something wet wrong.' });
	}
};

exports.getCandidateJobProfile = async (req, res, next) => {
	try {
		const { userId, jobId } = req.params;

		const studentRole = await roles.findOne({ where: { roleName: "Student" } });
		if (!studentRole) {
			return res.status(404).json({ status: false, message: "Student role not found." });
		}

		const query = `
		SELECT   
			ujs.jobStatusId,
			upc.partnerCode,
			u.isActive,
			j.jobId,
			j.jobTitle,
			j.companyName,
			j.companyThumbnail,
			j.description,
			j.modeOfWork,
			j.lastDateOfApply,
			j.employmentType,
			j.jobLocation,
			j.partnerJobId,
			j.minExperienceYears,
			j.minExperienceMonths,
			IFNULL(ujm.totalJobSkillsCount, 0) AS jobSkillsCount,
			IFNULL(ujm.unverifiedSkillsCount, 0) AS userAcquiredJobSkillsCount,
			IFNULL(ujm.unverifiedSkillMatchPercent, 0) AS jobMatchInPercentage,
			IFNULL(ujm.unverifiedSkillMatchPercent, 0) AS skillMatchInPercentage,
			IFNULL(ujm.jobExperienceInMonths, 0) AS jobExperienceInMonths,
			IFNULL(ujm.userExperienceInMonths, 0) AS userExperienceInMonths,
			IFNULL(ujm.experienceMatchInPercentage, 0) AS experienceMatchInPercentage,
			ROUND((IFNULL(ujm.unverifiedSkillMatchPercent, 0) + IFNULL(ujm.experienceMatchInPercentage, 0)) / 2, 0) AS overallFitMatchInPercentage,
			IFNULL(ujs.isShortlisted, false) AS isShortlisted,
			IFNULL(ujs.isHired, false) AS isHired
		FROM 
			jobs j
		JOIN 
			users u ON u.userId = :userId
		JOIN
			user_roles ur ON ur.userId = u.userId AND ur.roleId = :studentRoleId
		JOIN
			user_partner_codes upc ON upc.userId = u.userId
		LEFT JOIN
			user_job_status ujs ON ujs.jobId = j.jobId AND ujs.userId = u.userId
		LEFT JOIN (
			SELECT *
			FROM user_job_metrics
		) ujm ON ujm.jobId = j.jobId AND ujm.userId = u.userId
		WHERE
			j.jobId = :jobId AND
			j.isActive = true 
		`;

		const queryParams = {
			userId: userId,
			jobId: jobId,
			studentRoleId: studentRole.roleId
		};

		const candidateJobDetails = await sequelize.query(query, {
			replacements: queryParams,
			type: sequelize.QueryTypes.SELECT
		});

		if (candidateJobDetails.length == 0) {
			return res.status(404).json({ status: false, message: "No data found for the specified userId and jobId." });
		}

		res.status(200).json({ status: true, data: candidateJobDetails[0] });
	} catch (error) {
		console.error('Error fetching candidate job details:', error);
		res.status(500).json({ status: false, message: 'Something went wrong!' });
	}
};

exports.getskillData = async (req, res) => {
	try {
		const { jobId, userId } = req.params;
		const { categoryId, partnerCode } = req.query;
		let partnerCodeCondition = {};
		if (partnerCode) {
			partnerCodeCondition.partnerCode = partnerCode;
		}

		let jobQuery = `
			SELECT j.jobId, jg.goalId
			FROM jobs j LEFT JOIN job_goals jg ON j.jobId = jg.jobId
			WHERE j.jobId = :jobId AND j.isActive = true
		`;

		if (partnerCode) {
			jobQuery += ` AND j.partnerCode = '${partnerCode}'`;
		}

		const jobsData = await sequelize.query(jobQuery, {
			replacements: { jobId: jobId },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!jobsData.length) {
			return res.status(404).json({ status: false, message: 'No such job found.' });
		}

		if (!jobsData[0].goalId) {
			return res.status(404).json({ status: false, message: 'Goal not found.' });
		}

		let query = `
			SELECT s.userId
			FROM students s
			LEFT JOIN user_partner_codes upc ON s.userId = upc.userId
			WHERE s.userId = :userId`;

		let replacements = { userId };

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode;`;
			replacements.partnerCode = partnerCode;
		}

		const user = await sequelize.query(query, {
			replacements,
			type: sequelize.QueryTypes.SELECT
		});

		if (!user.length) {
			return res.status(404).json({ status: false, message: 'User Not Found!' });
		}

		let jobRoadmapQuery = `
			SELECT 
				c.categoryId, c.categoryName AS skillName, c.description AS skillDescription,
				ROUND(AVG(COALESCE(js.requiredSkillLevel))) AS requiredSkillLevel,
				ROUND(AVG(COALESCE(us.acquiredLevel, 0))) AS userSkillLevel,
				ROUND(AVG(COALESCE(us.resumeSkillLevel, 0))) AS resumeSkillLevel,
				CASE WHEN ROUND(SUM(COALESCE(us.acquiredLevel, 0)) / COUNT(us.skillId)) >= ROUND(SUM(js.requiredSkillLevel) / COUNT(js.skillId)) THEN TRUE ELSE FALSE END AS skillCompleted
			FROM goal_road_maps grm
			JOIN categories c ON c.categoryId = grm.categoryId
			LEFT JOIN job_skills js ON grm.skillId = js.skillId
			LEFT JOIN user_skills us ON (us.skillId = grm.skillId AND us.userId = :userId)
			WHERE grm.goalId = :goalId AND js.jobId = :jobId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
			GROUP BY c.categoryId, c.categoryName, c.description
			ORDER BY c.categoryId;`;

		if (categoryId) {
			const categoryExists = await categories.findOne({ where: { categoryId } });
			if (!categoryExists) {
				return res.status(404).json({ status: false, message: 'Category not found' });
			}

			jobRoadmapQuery = `
				SELECT sc.subCategoryName AS skillName, sc.subCategoryDescription AS skillDescription, 
					ROUND(AVG(COALESCE(js.requiredSkillLevel))) AS requiredSkillLevel,
					ROUND(AVG(COALESCE(us.acquiredLevel, 0))) AS userSkillLevel,
					ROUND(AVG(COALESCE(us.resumeSkillLevel, 0))) AS resumeSkillLevel,
					CASE WHEN ROUND(SUM(COALESCE(us.acquiredLevel, 0)) / COUNT(us.skillId)) >= ROUND(SUM(js.requiredSkillLevel) / COUNT(js.skillId)) THEN TRUE ELSE FALSE END AS skillCompleted
				FROM goal_road_maps grm
				JOIN sub_categories sc ON grm.subCategoryId = sc.subCategoryId
				LEFT JOIN job_skills js ON grm.skillId = js.skillId
				LEFT JOIN user_skills us ON (us.skillId = grm.skillId AND us.userId = :userId)
				WHERE grm.goalId = :goalId AND js.jobId = :jobId AND grm.categoryId = :categoryId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
				GROUP BY sc.subCategoryName, sc.subCategoryDescription
				ORDER BY sc.subCategoryId;
			`;
		}

		let jobRoadmap = await sequelize.query(jobRoadmapQuery, {
			replacements: { userId, goalId: jobsData[0].goalId, categoryId, jobId },
			type: sequelize.QueryTypes.SELECT
		});

		res.status(200).json({ status: true, data: jobRoadmap });
	} catch (error) {
		console.error('Error occurred while fetching profile details.', error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getQualificationsData = async (req, res) => {
	try {
		const { jobId, userId } = req.params;
		const { partnerCode } = req.query;
		let partnerCodeCondition = {};
		if (partnerCode) {
			partnerCodeCondition.partnerCode = partnerCode;
		}

		let jobQuery = `
			SELECT j.jobId, jg.goalId
			FROM jobs j LEFT JOIN job_goals jg ON j.jobId = jg.jobId
			WHERE j.jobId = :jobId AND j.isActive = true
		`;

		if (partnerCode) {
			jobQuery += ` AND j.partnerCode = '${partnerCode}'`;
		}

		const jobsData = await sequelize.query(jobQuery, {
			replacements: { jobId: jobId },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!jobsData.length) {
			return res.status(404).json({ status: false, message: 'No such job found.' });
		}

		if (!jobsData[0].goalId) {
			return res.status(404).json({ status: false, message: 'Goal not found.' });
		}

		let query = `
			SELECT s.userId
			FROM students s
			LEFT JOIN user_partner_codes upc ON s.userId = upc.userId
			WHERE s.userId = :userId`;

		let replacements = { userId };

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode;`;
			replacements.partnerCode = partnerCode;
		}

		const user = await sequelize.query(query, {
			replacements,
			type: sequelize.QueryTypes.SELECT
		});

		if (!user.length) {
			return res.status(404).json({ status: false, message: 'User Not Found!' });
		}

		let qualificationQuery = `
			SELECT 
				ug.jobId,
				ug.userId,
				g.goalId,
				g.goalName,
				g.shortDescription,
				g.thumbnail,
				ug.userAcquiredJobSkillsCount,
				ug.totalJobSkillsCount,
				ug.jobProgress,
				ug.userAcquiredRoadmapSkillsCount,
				ug.totalRoadmapSkillsCount,
				ug.roadmapProgress,
				g.isActive

			FROM user_goals ug
			JOIN goals g ON g.goalId = ug.goalId
			WHERE ug.userId = :userId AND ug.goalId = :goalId AND isActive = true;`
			;

		let qualificationData = await sequelize.query(qualificationQuery, {
			replacements: { userId, goalId: jobsData[0].goalId },
			type: sequelize.QueryTypes.SELECT
		});

		if (qualificationData[0].userAcquiredJobSkillsCount == null || qualificationData[0].totalJobSkillsCount == null || qualificationData[0].jobProgress == null || qualificationData[0].userAcquiredRoadmapSkillsCount == null || qualificationData[0].totalRoadmapSkillsCount == null || qualificationData[0].roadmapProgress == null) {
			const skillCountsQuery = `
				SELECT 
					(SELECT COUNT(id) FROM job_skills WHERE jobId = :jobId AND isGoatSkill = true) AS totalJobSkillsCount,

					(SELECT COUNT(us.id)
					FROM user_skills us
					INNER JOIN job_skills js ON js.skillId = us.skillId
					WHERE us.userId = :userId AND js.jobId = :jobId AND us.resumeSkillLevel >= 1 AND js.isGoatSkill = true) AS userAcquiredJobSkillsCount,

					(SELECT COUNT(DISTINCT grm.skillId)
					FROM goal_road_maps grm
					JOIN job_goals jg ON jg.goalId = grm.goalId
					WHERE jg.jobId = :jobId) AS totalRoadmapSkillsCount,

					(SELECT COUNT(DISTINCT us.skillId) AS userAcquiredRoadmapSkillsCount
					FROM user_skills us
					JOIN goal_road_maps grm ON grm.skillId = us.skillId AND grm.goalId = :goalId
				WHERE us.userId = :userId AND us.acquiredLevel >= 7) AS userAcquiredRoadmapSkillsCount
			`;

			const skillCountsResult = await sequelize.query(skillCountsQuery, {
				replacements: { userId: userId, jobId: jobId, goalId: jobsData[0].goalId },
				type: sequelize.QueryTypes.SELECT,
			});

			const {
				totalJobSkillsCount = 0,
				userAcquiredJobSkillsCount = 0,
				totalRoadmapSkillsCount = 0,
				userAcquiredRoadmapSkillsCount = 0,
			} = skillCountsResult[0] || {};

			const jobProgress = totalJobSkillsCount ? Math.round((userAcquiredJobSkillsCount / totalJobSkillsCount) * 100) : 0;
			const roadmapProgress = totalRoadmapSkillsCount ? Math.round((userAcquiredRoadmapSkillsCount / totalRoadmapSkillsCount) * 100) : 0;

			qualificationData[0].userAcquiredJobSkillsCount = userAcquiredJobSkillsCount
			qualificationData[0].totalJobSkillsCount = totalJobSkillsCount
			qualificationData[0].jobProgress = jobProgress
			qualificationData[0].userAcquiredRoadmapSkillsCount = userAcquiredRoadmapSkillsCount
			qualificationData[0].totalRoadmapSkillsCount = totalRoadmapSkillsCount
			qualificationData[0].roadmapProgress = roadmapProgress
			qualificationData[0].jobId = jobId

			await userGoals.update({
				userAcquiredJobSkillsCount,
				totalJobSkillsCount,
				jobProgress,
				userAcquiredRoadmapSkillsCount,
				totalRoadmapSkillsCount,
				roadmapProgress,
				jobId: jobId
			},
				{
					where: {
						userId: userId,
						goalId: jobsData[0].goalId
					}
				});

		}

		res.status(200).json({ status: true, data: qualificationData });
	} catch (error) {
		console.error('Error occurred while fetching Qualifications details.', error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

// getOfferAnalytics
exports.getOfferAnalytics = async (req, res) => {
	try {
		const { userId } = req.params;
		const mockRes = () => {
			const res = {};
			res.status = (status) => {
				res.statusCode = status;
				return res;
			};
			res.json = (data) => {
				res.data = data;
				return res;
			};
			return res;
		};

		const offerAnalyticsRes = mockRes();
		await studentController.getStudentPreferenceByUserId({ ...req, userId }, offerAnalyticsRes);
		let offerAnalyticsData = offerAnalyticsRes.data;
		if (!offerAnalyticsData.data) {
			offerAnalyticsData.data = {}
		} else {
			offerAnalyticsData.data.dataValues.offerAcceptanceProbabilityPercent = 75
			offerAnalyticsData.data.dataValues.offerLettersInHand = 1
			offerAnalyticsData.data.dataValues.facilities = ["PF", "Health Insurance", "Performance Bonus", "Relocation Assistance"]
		} 

		res.status(offerAnalyticsRes.statusCode).json(offerAnalyticsData);
	} catch (error) {
		console.error('Error occurred while fetching mocked Offer Analytics results.', error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.updateUserGoalMetrics = async (userId, jobId, partnerCode) => { 
	try {
		let jobQuery = `
			SELECT j.jobId, jg.goalId
			FROM jobs j LEFT JOIN job_goals jg ON j.jobId = jg.jobId
			WHERE j.jobId = :jobId AND j.isActive = true
		`;

		if (partnerCode) {
			jobQuery += ` AND j.partnerCode = '${partnerCode}'`;
		}

		const jobsData = await sequelize.query(jobQuery, {
			replacements: { jobId: jobId },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!jobsData.length) {
			return { statusCode: 400, status: false, message: 'No such job found.' }
		}

		if (!jobsData[0].goalId) {
			return { statusCode: 400, status: false, message: 'Goal not found.' }
		}

		const performanceCalculateQuery = `
			SELECT 
				j.jobId,
				j.minExperienceYears,
				j.minExperienceMonths,
				(IFNULL(j.minExperienceYears, 0) * 12 + IFNULL(j.minExperienceMonths, 0)) AS jobExperienceInMonths,
				IFNULL(se.experienceInMonths, 0) AS userExperienceInMonths,
				COALESCE(LEAST(ROUND((IFNULL(se.experienceInMonths, 0) / (IFNULL(j.minExperienceYears, 0) * 12 + IFNULL(j.minExperienceMonths, 0))) * 100, 0), 100), 0) AS experienceMatchInPercentage,
				
				grm.roadmapSkillsCount,
				uacquired.userAcquiredRoadmapSkillsCount,
				ROUND((IFNULL(uacquired.userAcquiredRoadmapSkillsCount, 0) / grm.roadmapSkillsCount) * 100, 0) AS roadmapProgress,

				js.jobSkillsCount,
				ujs_acquired.userAcquiredJobSkillsCount,
				ROUND((IFNULL(ujs_acquired.userAcquiredJobSkillsCount, 0) / js.jobSkillsCount) * 100, 2) AS skillMatchInPercentage,

				ROUND(IFNULL(j.salaryAvg, 0), 2) AS jobProvidedSalary,
				ROUND(sp.expectedSalary, 2) AS expectedSalary,
				LEAST(100, IF(expectedSalary IS NULL OR expectedSalary = 0, 0, (IFNULL(j.salaryAvg, 0) / expectedSalary) * 100)) AS salaryMatchInPercentage
			FROM 
				jobs j
			LEFT JOIN
				(SELECT jobId, COUNT(id) AS jobSkillsCount
				FROM job_skills WHERE isGoatSkill = true 
				GROUP BY jobId) js ON js.jobId = j.jobId
			LEFT JOIN
				(SELECT us.userId, js.jobId, COUNT(us.id) AS userAcquiredJobSkillsCount
				FROM user_skills us
				INNER JOIN job_skills js ON js.skillId = us.skillId
				WHERE us.resumeSkillLevel >= 1 AND js.isGoatSkill = true
				GROUP BY us.userId, js.jobId) ujs_acquired ON ujs_acquired.userId = :userId AND ujs_acquired.jobId = j.jobId
			LEFT JOIN (
				SELECT
					userId,
					ROUND(SUM(DATEDIFF(COALESCE(endDate, CURDATE()), startDate) / 30.0), 1) AS experienceInMonths
				FROM student_experiences
				WHERE userId = :userId
				GROUP BY userId
			) se ON se.userId = :userId	
			LEFT JOIN
				student_preferences sp ON sp.userId = :userId
			LEFT JOIN
				(SELECT jg.jobId, COUNT(DISTINCT grm.skillId) AS roadmapSkillsCount
				FROM goal_road_maps grm
				JOIN job_goals jg ON jg.goalId = grm.goalId
				GROUP BY jg.jobId) grm ON grm.jobId = :jobId
			LEFT JOIN
				(SELECT us.userId, jg.jobId, COUNT(DISTINCT us.skillId) AS userAcquiredRoadmapSkillsCount
				FROM user_skills us
				JOIN job_goals jg ON jg.goalId IN
						(SELECT goalId FROM goal_road_maps WHERE skillId = us.skillId)
				WHERE us.resumeSkillLevel >= 1
				GROUP BY us.userId, jg.jobId) uacquired ON uacquired.userId = :userId AND uacquired.jobId = :jobId
			WHERE
				j.jobId = :jobId AND
				j.isActive = true;
		`;

		const performanceMetrics = await sequelize.query(performanceCalculateQuery, {
			replacements: { userId, jobId },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!performanceMetrics.length) {
			return { statusCode: 400, status: false, message: 'Performance data not found.' }
		}

		const {
			jobExperienceInMonths = 0,
			userExperienceInMonths = 0,
			experienceMatchInPercentage = 0,
			roadmapSkillsCount = 0,
			userAcquiredRoadmapSkillsCount = 0,
			roadmapProgress = 0,
			jobSkillsCount = 0,
			userAcquiredJobSkillsCount = 0,
			skillMatchInPercentage = 0,
			jobProvidedSalary = 0,
			expectedSalary = 0,
			salaryMatchInPercentage = 0
		} = performanceMetrics[0];

		const updatedUserGoalsData = {
			jobExperienceInMonths: jobExperienceInMonths? jobExperienceInMonths: 0,
			userExperienceInMonths: userExperienceInMonths? userExperienceInMonths: 0,
			experienceMatchInPercentage: experienceMatchInPercentage? experienceMatchInPercentage: 0,
			userAcquiredRoadmapSkillsCount: userAcquiredRoadmapSkillsCount? userAcquiredRoadmapSkillsCount: 0,
			totalRoadmapSkillsCount: roadmapSkillsCount? roadmapSkillsCount: 0,
			roadmapProgress: roadmapProgress? roadmapProgress: 0,
			userAcquiredJobSkillsCount: userAcquiredJobSkillsCount? userAcquiredJobSkillsCount: 0,
			totalJobSkillsCount: jobSkillsCount? jobSkillsCount: 0,
			jobProgress: skillMatchInPercentage? skillMatchInPercentage: 0,
			userExpectedSalary: expectedSalary? expectedSalary: 0,
			jobProvidedSalary: jobProvidedSalary? jobProvidedSalary: 0,
			salaryMatchInPercentage: salaryMatchInPercentage? salaryMatchInPercentage: 0,
			jobId: jobId
		}

		const updatedUserGoals = await userGoals.update(updatedUserGoalsData,
			{
				where: {
					userId: userId,
					goalId: jobsData[0].goalId
				}
			}
		);

		return { statusCode: 200, status: true, data: updatedUserGoalsData };
	} catch (error) {
		console.error('Error occurred while fetching Performance Metrics.', error);
		return { statusCode: 500, status: false, message: "Something went wrong!" };
	}
};

exports.getPerformanceMetrics = async (req, res) => { 
	try {
		const { userId, jobId } = req.params;
		const { partnerCode } = req.query;

		const studentRole = await roles.findOne({ where: { roleName: "Student" } });
		if (!studentRole) {
			return res.status(404).json({ status: false, message: "Student role not found." });
		}

		let jobQuery = `
			SELECT j.jobId, jg.goalId
			FROM jobs j LEFT JOIN job_goals jg ON j.jobId = jg.jobId
			WHERE j.jobId = :jobId AND j.isActive = true
		`;

		if (partnerCode) {
			jobQuery += ` AND j.partnerCode = '${partnerCode}'`;
		}

		const jobsData = await sequelize.query(jobQuery, {
			replacements: { jobId: jobId },
			type: sequelize.QueryTypes.SELECT,
		});

		if (!jobsData.length) {
			return res.status(404).json({ status: false, message: 'No such job found.' });
		}

		if (!jobsData[0].goalId) {
			return res.status(404).json({ status: false, message: 'Goal not found.' });
		}

		let query = `
			SELECT s.userId
			FROM students s
			LEFT JOIN user_partner_codes upc ON s.userId = upc.userId
			WHERE s.userId = :userId`;

		let replacements = { userId };

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode;`;
			replacements.partnerCode = partnerCode;
		}

		const user = await sequelize.query(query, {
			replacements,
			type: sequelize.QueryTypes.SELECT
		});

		if (!user.length) {
			return res.status(404).json({ status: false, message: 'User Not Found!' });
		}

		const metricsQuery = `
			SELECT 
				JSON_OBJECT(
					'percent', ROUND((
                        IFNULL(ujm.locationMatchPercent, 0) +
                        IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0) +
                        IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) +
                        IFNULL(ujm.experienceMatchInPercentage, 0) +
						IFNULL(ujm.salaryMatchInPercentage, 0)
                    ) / 5, 2),
					'metricName', 'Overall Fit',
					'growthInPercent', 5
				) AS overallFit,

				JSON_OBJECT(
					'totalJobSkillsCount', IFNULL(ujm.totalJobSkillsCount, 0),
					'verifiedSkillLevelMatchCount', IFNULL(ujm.verifiedSkillsLevelMatchCount, 0),
					'verifiedSkillLevelMatchPercent', IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0)
				) AS verifiedSkillsData,

				JSON_OBJECT(
                    'totalJobSkillsCount', IFNULL(ujm.totalJobSkillsCount, 0),
                    'unverifiedSkillLevelMatchCount', IFNULL(ujm.unverifiedSkillsLevelMatchCount, 0),
                    'unverifiedSkillLevelMatchPercent', IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0)
                ) AS unverifiedSkillsData,    

				JSON_OBJECT(
					'missingSkills', IFNULL(ujm.missingSkills, 0),
					'remainingCourseTime', IFNULL(ujm.avgTrainingTime, 0)
				) AS avgTrainingTime,

				JSON_OBJECT(
				    'metricName', 'Logistic Fit',
					'jobLocation', j.jobLocation,
					'percent', IFNULL(ujm.locationMatchPercent, 0),
					'location', s.city,
					'isRelocate', sp.isRelocate,
					'isLocalLocation', IFNULL(ujm.isLocalLocation, 0)
				) AS logisticFit,

				JSON_OBJECT(
					'metricName', 'Financial Fit',
					'providedSalary', IFNULL(j.salaryAvg, 0),
					'expectedSalary', ROUND(sp.expectedSalary, 2),
					'percent', IFNULL(ujm.salaryMatchInPercentage, 0),
					'financialFitInsight', 
									CASE 
										WHEN sp.expectedSalary IS NULL THEN NULL
										WHEN COALESCE(sp.expectedSalary, 0) <= IFNULL(j.salaryAvg, 0) THEN 'Within the budget' 
										ELSE 'Over budget' 
									END
				) AS financialFit,
				JSON_OBJECT(
					'metricName', 'Experience Fit',
					'percent', IFNULL(ujm.experienceMatchInPercentage, 0),
					'acquiredExperienceInYears', ROUND(IFNULL(ujm.userExperienceInMonths, 0) / 12, 1),
					'requiredExperienceInYears', ROUND(IFNULL(ujm.jobExperienceInMonths, 0) / 12, 1)
				) AS experienceFit
			FROM 
			jobs j
			JOIN 
			users u ON u.userId = :userId
			JOIN 
			students s ON s.userId = u.userId
			JOIN
			user_partner_codes upc ON upc.userId = u.userId
			LEFT JOIN user_job_metrics ujm ON ujm.jobId = j.jobId AND ujm.userId = :userId
			LEFT JOIN
				student_preferences sp ON sp.userId = :userId
			LEFT JOIN (
			SELECT seh.userId,
				CASE WHEN cm.collegeName = 'Others' THEN seh.otherCollegeName ELSE cm.collegeName END AS collegeName,
				CASE WHEN sm.specialization = 'Others' THEN seh.otherSpecializationName ELSE sm.specialization END AS specialization
			FROM student_education_histories seh
			LEFT JOIN colleges_masters cm ON seh.collegeId = cm.collegeId
			LEFT JOIN specializations_masters sm ON seh.specializationId = sm.specializationId
			WHERE seh.userId = :userId
			ORDER BY seh.startDate DESC LIMIT 1
			) studentEducation ON studentEducation.userId = u.userId
			WHERE
			j.jobId = :jobId AND
			j.isActive = true 
		`;

		const metricsData = await sequelize.query(metricsQuery,{
			replacements: { userId, jobId },
			type: sequelize.QueryTypes.SELECT,
			}
		);

		return res.status(200).json({ status: true, data: metricsData[0] });
	} catch (error) {
		console.error('Error occurred while fetching Performance Metrics.', error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getAssessmentsList = async (req, res) => {
	try {
		const { userId } = req.params;
		const mockRes = () => {
			const res = {};
			res.status = (status) => {
				res.statusCode = status;
				return res;
			};
			res.json = (data) => {
				res.data = data;
				return res;
			};
			return res;
		};

		const assessmentReportRes = mockRes();
		//   req.query.isAssessmentType = true
		await studentController.assessmentTestReports({ ...req, userId }, assessmentReportRes);

		if (assessmentReportRes.statusCode == 400 || assessmentReportRes.data?.status === false) {
			return res.status(400).json({ status: false, message: assessmentReportRes.data?.message || 'Error occurred while fetching assessment report' });
		}

		const assessmentReportData = assessmentReportRes.data;

		const combinedDataPromises = assessmentReportData?.data?.map(async (assessment) => {
			const { userAssessmentId } = assessment;
			const assessmentResultsRes = mockRes();
			req.params.userAssessmentId = userAssessmentId;
			await studentController.getAssessmentResults({ ...req, userId }, assessmentResultsRes);
			const assessmentResultsData = assessmentResultsRes.data;

			return {
				...assessment,
				requiredJobSkillAvg: assessmentResultsData?.data?.requiredJobSubCategoryAvg,
				acquiredJobSkillAvg: assessmentResultsData?.data?.acquiredJobSubCategoryAvg,
			};
		});

		let combinedData = null;
		if (combinedDataPromises) {
			combinedData = await Promise.all(combinedDataPromises);
		}

		res.status(200).json({ status: true, data: combinedData });
	} catch (error) {
		console.error('Error occurred while fetching assessment report details.', error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getAssessmentResults = async (req, res) => {
	try {
		const { userId } = req.params;
		const mockRes = () => {
			const res = {};
			res.status = (status) => {
				res.statusCode = status;
				return res;
			};
			res.json = (data) => {
				res.data = data;
				return res;
			};
			return res;
		};

		const assessmentResultsRes = mockRes();
		await studentController.getAssessmentResults({ ...req, userId }, assessmentResultsRes);
		const assessmentResultsData = assessmentResultsRes.data;

		res.status(200).json(assessmentResultsData);
	} catch (error) {
		console.error('Error occurred while fetching mocked assessment results.', error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getProfileDetails = async (req, res) => {
	try {
		const { userId } = req.params;
		const { partnerCode } = req.query;
		let whereCondition = { userId }

		const userExists = await users.findOne({
			where: {
				userId
			}
		});

		if (!userExists) {
			return res.status(404).json({ status: false, message: 'User not found' });
		}

		if (partnerCode) {
			whereCondition.partnerCode = partnerCode
		}

		let query = `
			SELECT s.userId
			FROM students s
			LEFT JOIN user_partner_codes upc
			ON s.userId = upc.userId
			WHERE s.userId = :userId
		`;

		let replacements = {
			userId,
		};

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode;`;
			replacements.partnerCode = partnerCode;
		}

		const user = await sequelize.query(query, {
			replacements: replacements,
			type: sequelize.QueryTypes.SELECT
		});

		if (!user.length) {
			return res.status(404).json({ status: false, message: 'User not found' });
		}

		const mockRes = () => {
			const res = {};
			res.status = (status) => {
				res.statusCode = status;
				return res;
			};
			res.json = (data) => {
				res.data = data;
				return res;
			};
			return res;
		};

		const contactInfoRes = mockRes();
		await studentController.getContactInformation({ ...req, userId }, contactInfoRes);
		const contactInfo = contactInfoRes.data;

		const workHistoryRes = mockRes();
		await studentController.getUserWorkHistory({ ...req, userId }, workHistoryRes);
		const workHistories = workHistoryRes.data;

		const educationRes = mockRes();
		await studentController.getUserEducation({ ...req, userId }, educationRes);
		const educations = educationRes.data;

		const profilePictureRes = mockRes();
		await studentController.getProfilePicture({ ...req, userId }, profilePictureRes);
		const profilePicture = profilePictureRes.data;

		const resumeFileRes = mockRes();
		await studentController.getResumeFile({ ...req, userId }, resumeFileRes);
		const resumeFile = resumeFileRes.data;

		const selectedSkillCoursesListRes = mockRes();
		await studentController.selectedUserSkillList({ ...req, userId }, selectedSkillCoursesListRes);
		const selectedSkillCoursesListData = selectedSkillCoursesListRes.data;

		const profileDetails = {
			contactInformation: contactInfo.data,
			workHistory: workHistories.data,
			educationHistory: educations.data,
			profilePictureData: profilePicture.data,
			resumeFileData: resumeFile.data,
			skills: selectedSkillCoursesListData.data
		};

		res.status(200).json({ status: true, data: profileDetails });
	} catch (error) {
		console.error('Error occurred while fetching profile details.', error);
		res.status(500).json({ error: 'Something went wrong!' });
	}
};

exports.getShortListedCandidates = async (req, res) => {
	try {
		let { jobId, partnerCode, type, availability, outreachStatus, keyword } = req.query;

		jobId = parseInt(jobId);
		type = parseInt(type);
		outreachStatus = parseInt(outreachStatus);

		const replacements = {};

		let dataQuery = `
			SELECT
				ujs.jobStatusId, ujs.status, upc.partnerCode, s.userId, u.isActive, u.email, s.city, j.jobId, j.jobTitle, j.jobLocation, j.partnerJobId, sp.currentSalary, sp.expectedSalary, sp.availability, sp.isRelocate, null AS earliestStartDate, sp.location AS preferedLocation, latest_experience.jobTitle AS currentJobTitle, latest_experience.companyName AS lastWorkingCompany, s.city AS currentJobLocation, latest_experience.endDate AS currentJobEndDate, userAssessmentData.assessmentReport AS assessmentReportLink, userAssessmentData.assessmentStatus,
				CONCAT(s.firstName, " ", s.lastName) AS fullName,
				COALESCE(CONCAT(u.countryCode, u.phoneNumber), u.phoneNumber) AS contactInformation,
				CONCAT("${process.env.API_HOST_URL}", u.profilePicture) as profilePicture,
				CONCAT("${process.env.API_HOST_URL}", s.resumeFilePath) as userResume,
				CONCAT(s.city, ", ", s.state, ", ", s.country, ", ", s.postalCode) AS location,
				IFNULL(sp.outReach, 0) AS outReach,
				IFNULL(ujm.coreSkillPercent, 0) AS coreSkillPercent,
				IFNULL(ujm.avgTrainingTime, 0) AS avgTrainingTime,
				IFNULL(ujm.missingSkills, 0) AS missingSkills,
				IFNULL(ujm.unverifiedSkillsCount, 0) AS unverifiedSkillsCount,
				IFNULL(ujm.unverifiedSkillsCount, 0) AS coreSkills,
				IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0) AS unifiedVerifiedSkillMatchPercent,
				IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) AS unifiedUnverifiedSkillMatchPercent,
				IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) AS unifiedSkillMatchPercent,
				ROUND(IFNULL(ujm.userExperienceInMonths, 0) / 12, 1) AS experienceInYears,
				ROUND(IFNULL(ujm.jobExperienceInMonths, 0) / 12, 1) AS jobExperienceInYears,
				IFNULL(ujm.experienceMatchInPercentage, 0) AS experienceMatchInPercentage,
				IFNULL(s.careerGap, 0) AS isCareerGapOneYear,
				IF(userAssessmentData.userId, true, false) AS isAssessmentTaken,
				IFNULL(ujs.isShortlisted, false) AS isShortlisted,
				IFNULL(ujs.isHired, false) AS isHired
			FROM user_job_status ujs
			JOIN users u ON u.userId = ujs.userId
			JOIN students s ON s.userId = ujs.userId
			JOIN user_partner_codes upc ON upc.userId = ujs.userId
			JOIN jobs j ON j.jobId = ujs.jobId
			LEFT JOIN (
				SELECT *
				FROM user_job_metrics
			) ujm ON ujm.userId = ujs.userId AND ujm.jobId = ujs.jobId
			LEFT JOIN student_preferences sp ON sp.userId = u.userId
			LEFT JOIN (
				SELECT 
					se3.userId, se3.jobTitle, se3.location, se3.startDate, se3.endDate,
					CASE WHEN cm.companyName = 'Others' THEN se3.otherCompanyName ELSE cm.companyName END AS companyName
				FROM student_experiences se3
				LEFT JOIN companies_masters cm ON se3.companyId = cm.companyId
				WHERE se3.endDate IS NULL OR se3.startDate = (SELECT MAX(startDate) FROM student_experiences sub_se WHERE sub_se.userId = se3.userId)
				GROUP BY se3.userId
			) latest_experience ON latest_experience.userId = u.userId
			LEFT JOIN (
				SELECT
					ua.userId, ua.jobId, ua.userAssessmentId, ua.assessmentStatus, ua.assessmentReport
				FROM user_assessments ua
				WHERE ua.assessmentStatus IN ('DISQUALIFIED', 'REJECTED', 'COMPLETED') AND ua.assessmentType = 'preRoadmap' AND ua.assessmentFeeType = 'Sponsored'
				GROUP BY ua.userId, ua.jobId
			) userAssessmentData ON userAssessmentData.userId = u.userId AND userAssessmentData.jobId = ujs.jobId
			WHERE ujs.isShortlisted = 1 AND ujs.status = "SHORTLISTED"`
		;

		let countQuery = `
			SELECT
				SUM(CASE WHEN userData.userId THEN 1 ELSE 0 END) AS totalRecords
			FROM (
				SELECT DISTINCT(u.userId)
				FROM user_job_status ujs
				JOIN users u ON u.userId = ujs.userId
				JOIN students s ON s.userId = ujs.userId
				JOIN user_partner_codes upc ON upc.userId = ujs.userId
				JOIN jobs j ON j.jobId = ujs.jobId
				LEFT JOIN student_preferences sp ON sp.userId = u.userId
				WHERE ujs.status IS NOT NULL AND ujs.status = "SHORTLISTED"`
		;

		if (jobId) {
			dataQuery += ` AND ujs.jobId = :jobId`;
			countQuery += ` AND ujs.jobId = :jobId`;
			replacements.jobId = jobId;
		}

		if (partnerCode) {
			dataQuery += ` AND upc.partnerCode = :partnerCode`;
			countQuery += ` AND upc.partnerCode = :partnerCode`;
			replacements.partnerCode = partnerCode;
		}

		if(type >= 0) {
			dataQuery += ` AND IFNULL(s.careerGap, 0) = :type`;
			countQuery += ` AND IFNULL(s.careerGap, 0) = :type`;
			replacements.type = type;
		}

		if(availability) {
			dataQuery += ` AND sp.availability = :availability`;
			countQuery += ` AND sp.availability = :availability`;
			replacements.availability = availability;
		}

		if(outreachStatus >= 0) {
			dataQuery += ` AND IFNULL(sp.outReach, 0) = :outreachStatus`;
			countQuery += ` AND IFNULL(sp.outReach, 0) = :outreachStatus`;
			replacements.outreachStatus = outreachStatus;
		}

		if(keyword) {
			keyword = '%' + keyword + '%';
			dataQuery += ` AND CONCAT(s.firstName, " ", s.lastName) LIKE :keyword`;
			countQuery += ` AND CONCAT(s.firstName, " ", s.lastName) LIKE :keyword`;
			replacements.keyword = keyword;
		}

		dataQuery += `
			ORDER BY ujm.unverifiedSkillsCount DESC`
		;

		countQuery += ` ) AS userData;`;

		const {data, totalRecords, totalPages, currentPage, limit} = await paginateResults(req, countQuery, replacements, dataQuery, replacements);
		
		if(totalRecords) {
			return res.status(200).json({ status: true, data, totalRecords, totalPages, currentPage, limit });
		}
		
		res.status(200).json({status: true, data});
	} catch (error) {
		console.error('Error fetching shortlisted candidates:', error);
		res.status(500).json({ status: false, message: 'Failed to fetch shortlisted candidates' });
	}
};

exports.createShortListCandidates = async (req, res, next) => {
	try {
		const { jobId, userId } = req.body;
		const { partnerCode } = req.query;
		let partnerCodeCondition = {};
		if (partnerCode) {
			const partnerCodeExists = await partners.findOne({ where: { partnerCode } });
			if (!partnerCodeExists) {
				return res.status(404).json({ status: false, message: "Invalid Partner Code." });
			}
			partnerCodeCondition = { partnerCode };
		}

		const job = await jobs.findOne({
			where: {
				jobId,
				isActive: true, ...partnerCodeCondition
			}
		});
		if (!job) {
			return res.status(404).json({ status: false, message: 'Job not found.' });
		}

		const userGoalsData = await userGoals.findOne({
			where: {
				jobId, userId
			}
		});
		if (!userGoalsData) {
			return res.status(404).json({ status: false, message: 'User Goals not found.' });
		}

		let query = `
			SELECT s.userId
			FROM students s
			LEFT JOIN user_partner_codes upc
			ON s.userId = upc.userId
			WHERE s.userId = :userId
		`;

		let replacements = {
			userId,
		};

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode;`;
			replacements.partnerCode = partnerCode;
		}

		const user = await sequelize.query(query, {
			replacements,
			type: sequelize.QueryTypes.SELECT
		});

		if (!user) {
			return res.status(404).json({ status: false, message: 'User not found' });
		}

		let shortlistedCandidatesData = await userJobStatus.findOne({
			where: {
				jobId, userId
			},
			raw: true,
		});

		if (shortlistedCandidatesData) {
			if (shortlistedCandidatesData.isShortlisted && shortlistedCandidatesData.status && shortlistedCandidatesData.status !== 'REJECTED') {
				return res.status(404).json({ status: false, message: 'User already shortlisted.' });
			} else {
				await userJobStatus.update({ status: 'SHORTLISTED', lastUpdatedBy: req.hrId, isShortlisted: 1 }, { where: { jobId, userId } });
			}
		} else {
			shortlistedCandidatesData = await userJobStatus.create({ jobId, userId, status: 'SHORTLISTED', lastUpdatedBy: req.hrId, isShortlisted: 1 });
		}

		await userJobStatusTracking.create({ userJobStatusId: shortlistedCandidatesData.jobStatusId, status: "SHORTLISTED", action: "ADDED", hrId: req.hrId });
		// const jobCoursesData = await jobCourses.findAll({
		//     where: { jobId }, 
		//     attributes: ['courseId', 'levelRequired'] 
		// });

		// if (!jobCoursesData.length) {
		//     return { status: 404, message: "No courses found for this job" };
		// }

		// const userCoursePromises = jobCoursesData.map(course =>
		//     userCourses.findAll({
		//         where: {
		//             courseId: course.courseId,
		//             userId: userId,
		//             acquiredLevel: {
		//                 [Op.gte]: course.levelRequired
		//             },
		//         },
		//         attributes: {
		//             exclude: ['createdAt', 'updatedAt'],
		//         },
		//     })
		// );

		// const userCoursesData = await Promise.all(userCoursePromises);
		// const usersWithRequiredCourses = userCoursesData.flat();
		// const userIds = [...new Set(usersWithRequiredCourses.map(userCourse => userCourse.userId))];

		// if (!userIds.includes(parseInt(userId))) {
		//     return res.status(404).json({ status: false, message: 'User is not recommended for this job.' });
		// }
		res.status(200).json({ status: true, message: "Candidate has been pushed towards the concerned Business Manager." });

		await this.updatePartnerJobMetrics({jobId, partnerCode: req.partnerCode});
	} catch (error) {
		console.error("Encountered an error while shortlisting a candidate:", error);
		res.status(400).json({ status: false, message: "Something went wrong!" });
	}
};

exports.removeShortListCandidates = async (req, res, next) => {
	try {
		const { jobStatusId } = req.params;

		const { partnerCode } = req.query;
		let partnerCodeCondition = {};
		if (partnerCode) {
			partnerCodeCondition.partnerCode = partnerCode;
		}

		let query = `
			SELECT ujs.userId, ujs.status, ujs.jobId
			FROM user_job_status ujs
			JOIN user_partner_codes upc
			ON ujs.userId = upc.userId
			WHERE ujs.jobStatusId = :jobStatusId AND ujs.isShortlisted = 1 AND ujs.status = "SHORTLISTED"
		`;

		let replacements = { jobStatusId };

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode`;
			replacements.partnerCode = partnerCode;
		}

		const shortlistedCandidate = await sequelize.query(query, {
			type: QueryTypes.SELECT,
			replacements,
		});

		if (!shortlistedCandidate.length) {
			return res.status(404).json({ status: false, message: 'No such candidate in the shortlist data.' });
		}


		await userJobStatus.update({ status: null, lastUpdatedBy: req.hrId, isShortlisted: 0 }, { where: { jobStatusId } });
		await userJobStatusTracking.create({ userJobStatusId: jobStatusId, status: "SHORTLISTED", action: "REMOVED", hrId: req.hrId });

		res.status(200).json({ status: true, message: "User successfully removed from ShortList." });

		await this.updatePartnerJobMetrics({ jobId: shortlistedCandidate[0].jobId, partnerCode: req.partnerCode });
	} catch (error) {
		console.error("Encountered an error while removing candidate from short list: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getHiredCandidates = async (req, res) => {
	try {
		let { jobId, partnerCode } = req.query;

		if (jobId) {
			jobId = parseInt(jobId);
			let jobCheck = await jobs.findOne({ where: { jobId } });
			if (!jobCheck) {
				return res.status(404).json({ status: false, message: "Job not found. Please provide valid jobId." });
			}
		}

		let query = `
		SELECT
			ujs.jobStatusId, ujs.status, upc.partnerCode, s.userId, u.isActive, u.email, s.city, j.jobId, j.jobTitle, j.jobLocation, j.partnerJobId, sp.currentSalary, sp.expectedSalary, sp.availability, sp.isRelocate, null AS earliestStartDate, sp.location AS preferedLocation, latest_experience.jobTitle AS currentJobTitle, latest_experience.companyName AS lastWorkingCompany, s.city AS currentJobLocation, latest_experience.endDate AS currentJobEndDate,
			CONCAT(s.firstName, " ", s.lastName) AS fullName,
			COALESCE(CONCAT(u.countryCode, u.phoneNumber), u.phoneNumber) AS contactInformation,
			CONCAT("${process.env.API_HOST_URL}", u.profilePicture) as profilePicture,
			CONCAT("${process.env.API_HOST_URL}", s.resumeFilePath) as userResume,
			CONCAT(s.city, ", ", s.state, ", ", s.country, ", ", s.postalCode) AS location,
			IFNULL(sp.outReach, 0) AS outReach,
			IFNULL(ujm.coreSkillPercent, 0) AS coreSkillPercent,
			IFNULL(ujm.avgTrainingTime, 0) AS avgTrainingTime,
			IFNULL(ujm.missingSkills, 0) AS missingSkills,
			IFNULL(ujm.unverifiedSkillsCount, 0) AS unverifiedSkillsCount,
			IFNULL(ujm.unverifiedSkillsCount, 0) AS coreSkills,
			IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0) AS unifiedVerifiedSkillMatchPercent,
			IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) AS unifiedUnverifiedSkillMatchPercent,
			IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) AS unifiedSkillMatchPercent,
			ROUND(IFNULL(ujm.userExperienceInMonths, 0) / 12, 1) AS experienceInYears,
			ROUND(IFNULL(ujm.jobExperienceInMonths, 0) / 12, 1) AS jobExperienceInYears,
			IFNULL(ujm.experienceMatchInPercentage, 0) AS experienceMatchInPercentage,
			IFNULL(s.careerGap, 0) AS isCareerGapOneYear,
			userAssessmentData.assessmentReport AS assessmentReportLink,
			IF(userAssessmentData.userId, true, false) AS isAssessmentTaken,
			userAssessmentData.assessmentStatus,
			IFNULL(ujs.isShortlisted, false) AS isShortlisted,
			IFNULL(ujs.isHired, false) AS isHired
		FROM
			user_job_status ujs
		JOIN
			users u ON u.userId = ujs.userId
		JOIN
			students s ON s.userId = ujs.userId
		JOIN
			user_partner_codes upc ON upc.userId = ujs.userId
		JOIN
			jobs j ON j.jobId = ujs.jobId
		LEFT JOIN (
			SELECT *
			FROM user_job_metrics
		) ujm ON ujm.userId = ujs.userId AND ujm.jobId = ujs.jobId
		LEFT JOIN
			student_preferences sp ON sp.userId = u.userId
		LEFT JOIN (
			SELECT 
				se3.userId, se3.jobTitle, se3.location, se3.startDate, se3.endDate,
				CASE WHEN cm.companyName = 'Others' THEN se3.otherCompanyName ELSE cm.companyName END AS companyName
			FROM student_experiences se3
			LEFT JOIN companies_masters cm ON se3.companyId = cm.companyId
			WHERE se3.endDate IS NULL OR se3.startDate = (SELECT MAX(startDate) FROM student_experiences sub_se WHERE sub_se.userId = se3.userId)
			GROUP BY se3.userId
		) latest_experience ON latest_experience.userId = u.userId
		LEFT JOIN (
			SELECT
					ua.userId, ua.jobId, ua.userAssessmentId, ua.assessmentStatus, ua.assessmentReport
			FROM user_assessments ua
			WHERE ua.assessmentStatus IN ('DISQUALIFIED', 'REJECTED', 'COMPLETED') AND ua.assessmentType = 'preRoadmap' AND ua.assessmentFeeType = 'Sponsored'
			GROUP BY ua.userId, ua.jobId
		) userAssessmentData ON userAssessmentData.userId = u.userId AND userAssessmentData.jobId = ujs.jobId
		WHERE ujs.isHired = 1 OR COALESCE(ujs.status, '') = 'HIRED'
		`;

		if (jobId) {
			query += ` AND ujs.jobId = ${jobId}`;
		}

		if (partnerCode) {
			query += ` AND upc.partnerCode = "${partnerCode}"`;
		}

		query += ` ORDER BY ujm.unverifiedSkillsCount DESC`;

		const HiredCandidates = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT
		});;

		res.status(200).json({ status: true, data: HiredCandidates });
	} catch (error) {
		console.error('Error fetching Hired candidates:', error);
		res.status(500).json({ status: false, message: 'Failed to fetch Hired candidates' });
	}
};

exports.createHireCandidates = async (req, res, next) => {
	try {
		const { jobId, userId } = req.body;
		const { partnerCode } = req.query;
		let partnerCodeCondition = {};
		if (partnerCode) {
			const partnerCodeExists = await partners.findOne({ where: { partnerCode } });
			if (!partnerCodeExists) {
				return res.status(404).json({ status: false, message: "Invalid Partner Code." });
			}
			partnerCodeCondition = { partnerCode };
		}

		const job = await jobs.findOne({
			where: {
				jobId,
				isActive: true, ...partnerCodeCondition
			}
		});
		if (!job) {
			return res.status(404).json({ status: false, message: 'Job not found.' });
		}

		let query = `
			SELECT s.userId
			FROM students s
			LEFT JOIN user_partner_codes upc
			ON s.userId = upc.userId
			WHERE s.userId = :userId
		`;

		let replacements = {
			userId,
		};

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode;`;
			replacements.partnerCode = partnerCode;
		}

		const user = await sequelize.query(query, {
			replacements,
			type: sequelize.QueryTypes.SELECT
		});

		if (!user) {
			return res.status(404).json({ status: false, message: 'User not found.' });
		}

		const userGoalsData = await userGoals.findOne({
			where: {
				jobId, userId
			}
		});

		if (!userGoalsData) {
			return res.status(404).json({ status: false, message: 'User Goals not found.' });
		}

		const hiredCandidatesData = await userJobStatus.findOne({
			where: {
				jobId, userId
			}
		});

		if (hiredCandidatesData) {
			if (hiredCandidatesData.isHired && hiredCandidatesData.status && hiredCandidatesData.status === 'HIRED') {
				return res.status(404).json({ status: false, message: 'User already hired.' });
			} else {
				await userJobStatus.update({ status: 'HIRED', isHired: 1, lastUpdatedAt: req.hrId }, { where: { jobId, userId } });
			}
		} else {
			hiredCandidatesData = await userJobStatus.create({ jobId, userId, status: 'HIRED', isHired: 1, lastUpdatedBy: req.hrId });
		}

		await userJobStatusTracking.create({userJobStatusId: hiredCandidatesData.jobStatusId, status: "HIRED", action: "ADDED", hrId: req.hrId});

		res.status(200).json({ status: true, message: "Candidate Successfully Hired." });

		await this.updatePartnerJobMetrics({jobId, partnerCode: req.partnerCode});
	} catch (error) {
		console.error("Encountered an error while hiring a candidate: ", error);
		res.status(400).json({ status: false, message: "Something went wrong!" });
	}
};

exports.removeHireCandidates = async (req, res, next) => {
	try {
		const { jobStatusId } = req.params;

		const { partnerCode } = req.query;
		let partnerCodeCondition = {};
		if (partnerCode) {
			partnerCodeCondition.partnerCode = partnerCode;
		}

		let query = `
			SELECT ujs.userId, ujs.jobId
			FROM user_job_status ujs
			JOIN user_partner_codes upc
			ON ujs.userId = upc.userId
			WHERE ujs.jobStatusId = :jobStatusId AND (ujs.isHired = 1 OR COALESCE(ujs.status, '') = 'HIRED')
		`;

		let replacements = { jobStatusId };

		if (partnerCode) {
			query += ` AND upc.partnerCode = :partnerCode`;
			replacements.partnerCode = partnerCode;
		}

		const hiredCandidate = await sequelize.query(query, {
			type: QueryTypes.SELECT,
			replacements,
		});

		if (!hiredCandidate.length) {
			return res.status(404).json({ status: false, message: 'No such candidate in the hired data.' });
		}

		await userJobStatus.update({ status: 'REJECTED', lastUpdatedAt: req.hrId, isShortlisted: 0, isHired: 0 }, { where: { jobStatusId } });

		await userJobStatusTracking.create([{ userJobStatusId: jobStatusId, status: "HIRED", action: "REMOVED", hrId: req.hrId }, { userJobStatusId: jobStatusId, status: "REJECTED", action: "ADDED", hrId: req.hrId }]);

		res.status(200).json({ status: true, message: "User successfully removed from the Hired list." });

		await this.updatePartnerJobMetrics({ jobId: hiredCandidate[0].jobId, partnerCode: req.partnerCode });
	} catch (error) {
		console.error("Encountered an error while removing candidate from hire list: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

// Hr Portal Job CRUD API Controllers
const getSkillLevelCode = (requiredSkillLevel) => {
	if (requiredSkillLevel >= 1 && requiredSkillLevel <= 3) {
		return 'BEGINNER';
	} else if (requiredSkillLevel >= 4 && requiredSkillLevel <= 6) {
		return 'INTERMEDIATE';
	} else if (requiredSkillLevel >= 7 && requiredSkillLevel <= 10) {
		return 'ADVANCED';
	} else {
		return 'UNKNOWN';
	}
};

exports.postOpportunity = async (req, res, next) => {
	try {
		const { userId, partnerCode, companyName, companyThumbnail } = req;

		const { jobSkills: jobSkillsBody, facilities, ...rest } = req.body;

		rest.jobTitle = rest.jobTitle ? rest.jobTitle.trim() : rest.jobTitle;
		if (!rest.jobTitle) {
			return res.status(400).json({ status: false, message: "Please provide a valid job title!" });
		}
		if (!rest.salaryFrom && !rest.salaryTo) {
			return res.status(400).json({ status: false, message: "Salary must be mentioned." });
		}
		if (!rest.salaryFrom) {
			rest.salaryFrom = rest.salaryTo
		}
		if (!rest.salaryTo) {
			rest.salaryTo = rest.salaryFrom
		}
		if (rest.salaryFrom > rest.salaryTo) {
			return res.status(400).json({ status: false, message: 'Invalid Salary Range!' });
		}

		const jobDetails = await jobs.create(rest);
		const jobId = jobDetails.dataValues.jobId;

		if (facilities) {
			const facilityIds = [...new Set(facilities.map(item => item.facilityId))];
			const foundFacilities = await facilityMasters.findAll({
				where: { facilityId: { [Op.in]: facilityIds } },
				attributes: ['facilityId', 'facilityName'],
			});

			if (foundFacilities.length != facilityIds.length) {
				const foundFacilityIds = foundFacilities.map((facility) => facility.facilityId);
				const nonExistingIds = facilityIds.filter((id) => !foundFacilityIds.includes(id));
				await t.rollback();
				return res.status(404).json({ status: false, message: `Facility(s) with ID(s) ${nonExistingIds.join(', ')} not found.` });
			}

			const otherFacilityId = foundFacilities.find(facility => facility.facilityName == 'Others')?.facilityId || null;

			const facilitiesCreateObj = facilities.map(facility => {
				if (facility.facilityId == otherFacilityId && !facility.otherFacilityName) {
					t.rollback();
					return res.status(404).json({ status: false, message: `Please provide a valid otherFacilityName` });
				}
				let tempFacility = {
					facilityId: facility.facilityId,
					jobId: jobId,
				};
				if (facility.facilityId == otherFacilityId) {
					tempFacility.otherFacilityName = facility.otherFacilityName;
				}
				return tempFacility;
			});

			await jobModel.jobFacilities.bulkCreate(facilitiesCreateObj, {
				fields: ['facilityId', 'otherFacilityName', 'jobId'],
			});
		}

		if (jobSkillsBody) {
			const categoryIds = [...new Set(jobSkillsBody.map(item => item.categoryId))];
			const foundCategories = await categories.findAll({
				where: { categoryId: { [Op.in]: categoryIds } },
			});

			if (foundCategories.length != categoryIds.length) {
				const foundCategoryIds = foundCategories.map((category) => category.categoryId);
				const nonExistingIds = categoryIds.filter((id) => !foundCategoryIds.includes(id));
				await t.rollback();
				return res.status(404).json({ status: false, message: `Category(s) with ID(s) ${nonExistingIds.join(', ')} not found.` });
			}

			const skillsWithJob = jobSkillsBody.flatMap(category =>
				category.skills.map(skill => ({
					skillId: skill.skillId,
					requiredSkillLevel: skill.requiredSkillLevel,
					skillLevelCode: getSkillLevelCode(skill.requiredSkillLevel),
					jobId: jobId
				}))
			);

			const skillIds = [...new Set(skillsWithJob.map(skill => skill.skillId))];
			const requiredSkillLevelS = [...new Set(skillsWithJob.map(skill => skill.requiredSkillLevel))];

			const isAllRequiredSkillLevelSInRange = requiredSkillLevelS.every(num => num >= 0 && num <= 10);
			if (!isAllRequiredSkillLevelSInRange) {
				await t.rollback();
				return res.status(400).json({ status: false, message: 'Required Skill Level should be between 0 and 10(inclusive).' });
			}

			const foundSkills = await skills.findAll({
				where: { skillId: { [Op.in]: skillIds } },
			});

			if (foundSkills.length != skillIds.length) {
				const foundSkillIds = foundSkills.map((skill) => skill.skillId);
				const nonExistingIds = skillIds.filter((id) => !foundSkillIds.includes(id));
				await t.rollback();
				return res.status(404).json({ status: false, message: `skill(s) with ID(s) ${nonExistingIds.join(', ')} not found.` });
			}

			await jobSkills.bulkCreate(skillsWithJob, {
				fields: ['skillId', 'requiredSkillLevel', 'skillLevelCode', 'jobId'],
			});
		}

		await t.commit();

		res.status(200).json({ status: true, message: 'Opportunity created successfully.' });

		await this.updatePartnerOverallMetrics({partnerCode: req.partnerCode});
	} catch (error) {
		await t.rollback();
		console.error("Encountered an error while creating opportunity: ", error);
		res.status(500).json({status: false, message: 'Something went wrong!'});
	}
};

exports.getOpportunities = async (req, res, next) => {
	try {
		const mockRes = () => {
			const res = {};
			res.status = (status) => {
				res.statusCode = status;
				return res;
			};
			res.json = (data) => {
				res.data = data;
				return res;
			};
			return res;
		};

		const getJobs = mockRes();
		req.isAllJobs = true
		await studentController.getJobs(req, getJobs);
		const getJobsData = getJobs.data;

		res.status(200).json(getJobsData);
	} catch (error) {
		console.error(error);
		return res.status(400).json({ status: false, message: "Unable to fetch jobs." });
	}
};

exports.getJobDetails = async (req, res) => {
	try {
		const { jobId } = req.params;
		const mockRes = () => {
			const res = {};
			res.status = (status) => {
				res.statusCode = status;
				return res;
			};
			res.json = (data) => {
				res.data = data;
				return res;
			};
			return res;
		};

		const getJobDetailsData = mockRes();
		req.userId = null;
		req.isAllJobs = true

		await studentController.getJobDetails(req, getJobDetailsData);
		const assessmentReportData = getJobDetailsData.data;

		if (assessmentReportData.data) {
			const facilityMastersData = await facilityMasters.findAll({ where: { isActive: true }, attributes: ['facilityId', 'facilityName'] });

			let jobFacilitiesList = await jobFacilities.findAll({ attributes: ['facilityId', 'otherFacilityName'], where: { jobId } });
			const jobFacilitiesIds = jobFacilitiesList.map(facility => facility.facilityId);
			const jobFacilitiesOthers = jobFacilitiesList.map(facility => facility.otherFacilityName).filter(otherFacilityName => otherFacilityName != null);
			var jobFacilitiesData = facilityMastersData.flatMap(facility => {
				if (facility.facilityName == "Others" && jobFacilitiesIds.includes(facility.facilityId)) {
					return (jobFacilitiesOthers.map(othersFacility => ({
						...facility.dataValues,
						facilityName: facility.facilityName,
						othersFacility: othersFacility,
						isSelect: true
					})));
				}
				if (facility.facilityName != "Others") {
					return {
						...facility.dataValues,
						isSelect: jobFacilitiesIds.includes(facility.facilityId)
					}
				}
			}).filter(facility => facility != null && facility.isSelect);
		}

		if (assessmentReportData.data) {
			assessmentReportData.data.jobFacilitiesData = jobFacilitiesData;
		}

		res.status(200).json({ status: true, assessmentReportData });
	} catch (error) {
		console.error('Error occurred while fetching job details.', error);
		return res.status(500).json({ error: 'Something went wrong!' });
	}
};

exports.updateJobDetails = async (req, res, next) => {
	try {
		let { jobId } = req.params;

		jobId = +jobId;

		const jobExists = await jobs.findOne({ where: { jobId } });

		if (!jobExists) {
			return res.status(404).json({ status: false, message: "No such job found." });
		}

		const newJobData = req.body;

		if (newJobData.salaryFrom && newJobData.salaryTo) {
			if (newJobData.salaryFrom > newJobData.salaryTo) {
				return res.status(400).json({ status: false, message: 'Invalid Salary Range!' });
			}
		}

		if (newJobData.jobTitle?.trim().length === 0) {
			return res.status(400).json({ status: false, message: "Job Title can not be empty!" })
		}

		const updatedJobsData = await jobs.update(newJobData, { where: { jobId } });

		res.status(200).json({ status: false, message: 'Job Data updated successfully.' });
	} catch (error) {
		console.error("Encountered an error while updating job details: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.updateRequiredSkillLevel = async (req, res, next) => {
	try {
		let { jobId, skillId } = req.params;

		jobId = +jobId;
		skillId = +skillId;

		let newSkillLevel = req.body.skillLevel;


		if (!newSkillLevel) {
			return res.status(400).json({ status: false, message: "Please provide the updated level for skill." });
		}

		const jobExists = await jobs.findOne({ where: { jobId } });

		if (!jobExists) {
			return res.status(404).json({ status: false, messgae: "No such job found." });
		}

		const skillExists = await skills.findOne({ where: { skillId } });

		if (!skillExists) {
			return res.status(404).json({ status: false, message: "No such skill found." });
		}

		const jobSkillExists = await jobSkills.findOne({ where: { jobId, skillId } });

		const skillObj = {
			skillId,
			requiredSkillLevel: newSkillLevel,
			skillLevelCode: getSkillLevelCode(newSkillLevel),
			jobId
		};

		if (!jobSkillExists) {
			await jobSkills.create(skillObj);
		} else {
			await jobSkills.update(skillObj, {
				where: { jobId, skillId }
			});
		}

		res.status(200).json({ status: true, message: `Required Skill Level for Skill Id ${skillId} and Job Id ${jobId} updated successfully.` });
	} catch (error) {
		console.error("Encountered an error while updating job required skill level: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.updateJobFacilities = async (req, res, next) => {
	try {
		let { jobId } = req.params;
		jobId = +jobId;

		const jobExists = await jobs.findOne({ where: { jobId } });
		if (!jobExists) {
			return res.status(404).json({ status: false, message: "No such job found." });
		}

		const { facilities } = req.body;
		if (!facilities || !facilities.length) {
			return res.status(400).json({ status: false, message: "Please provide updated facilities." });
		}

		const facilityIds = [...new Set(facilities.map(item => item.facilityId))];

		const foundFacilities = await facilityMasters.findAll({
			where: { facilityId: { [Op.in]: facilityIds } },
			attributes: ['facilityId', 'facilityName'],
		});

		if (foundFacilities.length != facilityIds.length) {
			const foundFacilityIds = foundFacilities.map((facility) => facility.facilityId);
			const nonExistingIds = facilityIds.filter((id) => !foundFacilityIds.includes(id));
			await t.rollback();
			return res.status(404).json({ status: false, message: `Facility(s) with ID(s) ${nonExistingIds.join(', ')} not found.` });
		}

		const otherFacilityId = foundFacilities.find(facility => facility.facilityName == 'Others')?.facilityId || null;
		const facilitiesCreateObj = facilities.map(facility => {
			if (facility.facilityId == otherFacilityId && !facility.otherFacilityName) {
				t.rollback();
				return res.status(404).json({ status: false, message: `Please provide a valid otherFacilityName` });
			}

			return {
				facilityId: facility.facilityId,
				jobId,
				otherFacilityName: facility.facilityId == otherFacilityId ? facility.otherFacilityName : null
			};
		});

		const removeDuplicates = (data) => {
			return data.filter((item, index, self) =>
				index == self.findIndex((t) => (
					t.facilityId == item.facilityId &&
					(t.otherFacilityName ? t.otherFacilityName == item.otherFacilityName : true)
				))
			);
		}
		const uniqueFacilitiesCreateObj = removeDuplicates(facilitiesCreateObj);

		await jobModel.jobFacilities.destroy({ where: { jobId } });
		await jobModel.jobFacilities.bulkCreate(uniqueFacilitiesCreateObj, {
			fields: ['facilityId', 'otherFacilityName', 'jobId'],
		});

		await t.commit();
		res.status(200).json({ status: true, message: "Job Facilities updated successfully." });

	} catch (error) {
		await t.rollback();
		console.error("Encountered an error while updating job facilities: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.deleteJobData = async (req, res, next) => {
	try {
		const { jobId } = req.params;
		const { partnerCode, forceDelete } = req.query;

		let partnerCodeCondition = {};
		if (partnerCode) {
			partnerCodeCondition.partnerCode = partnerCode;
		}

		const job = await jobs.findOne({ where: { jobId, ...partnerCodeCondition } });
		if (!job) {
			return res.status(404).json({ status: false, message: "Job Not Found" });
		}

		const usersExitWithJobSkills = await userJobSkills.findOne({ where: { jobId } });
		if (usersExitWithJobSkills && forceDelete != 'true') {
			return res.status(404).json({ status: false, message: 'Unable to delete job. Enrolled by users.' });
		}

		await jobSkills.destroy({ where: { jobId }, });
		await jobFacilities.destroy({ where: { jobId }, });
		await jobs.destroy({ where: { jobId }, });
		if (usersExitWithJobSkills) {
			await userJobSkills.destroy({ where: { jobId }, });
		}

		res.status(200).json({ status: true, message: "Job and associated data deleted successfully" });

		await this.updatePartnerOverallMetrics({ partnerCode: req.partnerCode });
	} catch (error) {
		console.error('Error deleting job data:', error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

const getGithubStars = async (githubUrl) => {
  try {
    const username = githubUrl.split('/').pop();
    if (!username) {
      console.error("Invalid Github URL");
			return 0;
    }

    // GitHub API endpoint
    const apiUrl = `https://api.github.com/users/${username}/repos`;

    const response = await axios.get(apiUrl, {
      headers: {
        "Accept": "application/vnd.github.v3+json", // Optional: Specify API version
      },
    });
		// console.log(response);

    const repos = response.data;
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);

    return totalStars;
  } catch (error) {
    console.error("Encountered an error while fetching github stars: ", error);
    return 0;
  }
};

exports.assessmentReportDataFunc = async (userId, jobIdAndPartnerCode) => {
	try {
		const { jobId, partnerCode } = jobIdAndPartnerCode;

		// if (!jobId) {
		// 	return { statusCode: 400, status: false, message: 'jobId is required.' }
		// }
	
		const userData = await users.findOne({ where: { userId } });
		if(!userData) {
			return { statusCode: 400, status: false, message: 'User Not Found.' }
		}
		if(!userData.isActive) {
			return { statusCode: 400, status: false, message: 'User Account Deactivated.' }
		}
	
		const studentRoleQuery = `SELECT ur.userId FROM user_roles ur JOIN roles r ON ur.roleId = r.roleId WHERE ur.userId = :userId AND r.roleName = 'student'`
		const studentRole = await sequelize.query(studentRoleQuery, {
		  replacements: { userId },
				type: sequelize.QueryTypes.SELECT
		});
	
		if (!studentRole.length) {
			return { statusCode: 404, status: false, message: 'Student Not Found.' }
		}
	
		let goalId;
		if (jobId) {
			let jobQuery = `
				SELECT j.jobId, jg.goalId
				FROM jobs j LEFT JOIN job_goals jg ON j.jobId = jg.jobId
				WHERE j.jobId = :jobId AND j.isActive = true
			`;

			if (partnerCode) {
				jobQuery += ` AND j.partnerCode = '${partnerCode}'`;
			}

			const jobsData = await sequelize.query(jobQuery, {
				replacements: { jobId: jobId },
				type: sequelize.QueryTypes.SELECT,
			});

			if (!jobsData.length) {
				return res.status(404).json({ status: false, message: 'No such job found.' });
			}

			if (!jobsData[0].goalId) {
				return res.status(404).json({ status: false, message: 'Goal not found.' });
			}

			goalId = jobsData[0].goalId
		}
		
		// TODO Within Budget
        let query = `
          SELECT
            JSON_OBJECT(
                'firstName', s.firstName,
                'lastName', s.lastName,
                'collegeName', studentEducation.collegeName,
                'stream', studentEducation.specialization,
                'gender', s.gender,
                'isRtw', IFNULL(s.careerGap, 0),
                'isImmediateJoiner', CASE WHEN sp.availability = '0 - 15 Days' THEN TRUE ELSE FALSE END,
                'profilePicture', CONCAT("${process.env.API_HOST_URL}", u.profilePicture),
                'verifiedSkillLevelMatchPercent', ujs_acquired.verifiedSkillLevelMatchCount,
								'isTopTenRecommended', false,
								'isVerified', u.isVerified
            ) AS userProfileDetails,
                
            JSON_OBJECT(
                'email', u.email,
                'countryCode', u.countryCode,
                'phoneNumber', u.phoneNumber
            ) AS contactInformation,

            JSON_OBJECT(
                'currentSalary', ROUND(IFNULL(sp.currentSalary, 0), 1),
                'expectedSalary', ROUND(IFNULL(sp.expectedSalary, 0), 1),
                'noticePeriod', sp.availability
            ) AS compensationDetails,

            JSON_OBJECT(
                'currentLocation', s.city,
                'workMode', sp.employmentType,
                'isRelocate', sp.isRelocate
            ) AS locationDetails
            
            FROM 
            users u
            JOIN 
            students s ON s.userId = u.userId
            JOIN
            user_partner_codes upc ON upc.userId = u.userId
            LEFT JOIN (
                SELECT 
                userId,
                ROUND(AVG(IFNULL(verifiedSkillLevelMatchPercent, 0))) AS verifiedSkillLevelMatchCount
            FROM user_goals
            WHERE userId = :userId
						GROUP BY userId
            ) ujs_acquired ON ujs_acquired.userId = u.userId
            LEFT JOIN
                student_preferences sp ON sp.userId = :userId
            LEFT JOIN (
            SELECT seh.userId,
                CASE WHEN cm.collegeName = 'Others' THEN seh.otherCollegeName ELSE cm.collegeName END AS collegeName,
                CASE WHEN sm.specialization = 'Others' THEN seh.otherSpecializationName ELSE sm.specialization END AS specialization
            FROM student_education_histories seh
            LEFT JOIN colleges_masters cm ON seh.collegeId = cm.collegeId
            LEFT JOIN specializations_masters sm ON seh.specializationId = sm.specializationId
            WHERE seh.userId = :userId
            ORDER BY seh.startDate DESC LIMIT 1
            ) studentEducation ON studentEducation.userId = u.userId
            WHERE u.userId = :userId
        `;
        let queryParams = { userId: userId };

		if (jobId) {
            query = `
                SELECT
    
                    JSON_OBJECT(
                    'isActive', u.isActive,
                    'candidateReferenceId', u.uniqueId,
                    'jobId', j.jobId,
                    'jobRole', j.jobTitle,
                    'jobReferenceID', j.partnerJobId,
                    'generatedDate', DATE_FORMAT(j.createdAt, '%M %d, %Y')
                ) AS CandidateJobData,
    
                    JSON_OBJECT(
                    'firstName', s.firstName,
                    'lastName', s.lastName,
                    'collegeName', studentEducation.collegeName,
                    'stream', studentEducation.specialization,
                    'gender', s.gender,
                    'isRtw', IFNULL(s.careerGap, 0),
                    'isImmediateJoiner', CASE WHEN sp.availability = '0 - 15 Days' THEN TRUE ELSE FALSE END,
                    'profilePicture', CONCAT("${process.env.API_HOST_URL}", u.profilePicture),
                    'verifiedSkillLevelMatchPercent', IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0),
										'isTopTenRecommended', false,
										'isVerified', u.isVerified
                ) AS userProfileDetails,
    
                JSON_OBJECT(
                    'email', u.email,
                    'countryCode', u.countryCode,
                    'phoneNumber', u.phoneNumber
                ) AS contactInformation,
    
                JSON_OBJECT(
                    'currentSalary', ROUND(IFNULL(sp.currentSalary, 0), 1),
                    'expectedSalary', ROUND(IFNULL(sp.expectedSalary, 0), 1),
                    'noticePeriod', sp.availability
                ) AS compensationDetails,
    
                JSON_OBJECT(
                    'currentLocation', s.city,
                    'workMode', sp.employmentType,
                    'isRelocate', sp.isRelocate
                ) AS locationDetails,
    
                JSON_OBJECT(
                    'overallFitMatchInPercentage', ROUND((
                        IFNULL(ujm.locationMatchPercent, 0) +
                        IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0) +
                        IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0) +
                        IFNULL(ujm.experienceMatchInPercentage, 0) +
						IFNULL(ujm.salaryMatchInPercentage, 0)
                    ) / 5, 2)
                ) AS overallFitData,
                    
                JSON_OBJECT(
                    'totalJobSkillsCount', IFNULL(ujm.totalJobSkillsCount, 0),
                    'verifiedSkillLevelMatchCount', IFNULL(ujm.verifiedSkillsLevelMatchCount, 0),
                    'verifiedSkillLevelMatchPercent', IFNULL(ujm.unifiedVerifiedSkillMatchPercent, 0)
                ) AS verifiedSkillsData,
    
                JSON_OBJECT(
                    'totalJobSkillsCount', IFNULL(ujm.totalJobSkillsCount, 0),
                    'unverifiedSkillLevelMatchCount', IFNULL(ujm.unverifiedSkillsLevelMatchCount, 0),
                    'unverifiedSkillLevelMatchPercent', IFNULL(ujm.unifiedUnverifiedSkillMatchPercent, 0)
                ) AS unverifiedSkillsData,
    
                JSON_OBJECT(
                    'missingSkills', IFNULL(ujm.missingSkills, 0),
                    'remainingCourseTime', IFNULL(ujm.avgTrainingTime, 0)
                ) AS avgTrainingTime,
    
                JSON_OBJECT(
                    'logisticFitInPercent', IFNULL(ujm.locationMatchPercent, 0),
                    'location', s.city,
					'isRelocate', sp.isRelocate,
                    'isLocalLocation', IFNULL(ujm.isLocalLocation, 0)
                ) AS logisticFitData,
    
                JSON_OBJECT(
					'salaryMatchInPercentage', IFNULL(ujm.salaryMatchInPercentage, 0),
                    'financialFitInsight', 
                                    CASE 
                                        WHEN sp.expectedSalary IS NULL THEN NULL
                                        WHEN COALESCE(sp.expectedSalary, 0) <= IFNULL(j.salaryAvg, 0) THEN 'Within the budget' 
                                        ELSE 'Over budget' 
                                    END
                ) AS financialFitData,
    
                JSON_OBJECT(
                    'experienceMatchInPercentage', IFNULL(ujm.experienceMatchInPercentage, 0),
                    'userExperienceInYears', ROUND(IFNULL(ujm.userExperienceInMonths, 0) / 12, 1)
                ) AS experienceFitData
                FROM 
                jobs j
                JOIN 
                users u ON u.userId = :userId
                JOIN 
                students s ON s.userId = u.userId
                JOIN
                user_partner_codes upc ON upc.userId = u.userId
				LEFT JOIN user_job_metrics ujm ON ujm.jobId = j.jobId AND ujm.userId = :userId
                LEFT JOIN
                    student_preferences sp ON sp.userId = :userId
                LEFT JOIN (
                SELECT seh.userId,
                    CASE WHEN cm.collegeName = 'Others' THEN seh.otherCollegeName ELSE cm.collegeName END AS collegeName,
                    CASE WHEN sm.specialization = 'Others' THEN seh.otherSpecializationName ELSE sm.specialization END AS specialization
                FROM student_education_histories seh
                LEFT JOIN colleges_masters cm ON seh.collegeId = cm.collegeId
                LEFT JOIN specializations_masters sm ON seh.specializationId = sm.specializationId
                WHERE seh.userId = :userId
                ORDER BY seh.startDate DESC LIMIT 1
                ) studentEducation ON studentEducation.userId = u.userId
                WHERE
                j.jobId = :jobId AND
                j.isActive = true 
            `;
            queryParams.jobId = jobId
	  
		}
		
		if (partnerCode) {
				query += ` AND upc.partnerCode = :partnerCode`;
				queryParams.partnerCode = partnerCode;
			}
			const candidateAssessmentDetails = await sequelize.query(query, {
				replacements: queryParams,
				type: sequelize.QueryTypes.SELECT
			});

		let skillAnalysisQuery = `
			SELECT
				c.categoryId,
				c.categoryName,
				ROUND(AVG(COALESCE(js.requiredSkillLevel, 0)), 2) AS requiredSkillLevel,
				ROUND(AVG(COALESCE(us.acquiredLevel, 0)), 2) AS verifiedSkillLevel,
				ROUND(AVG(COALESCE(us.resumeSkillLevel, 0)), 2) AS unverifiedSkillLevel,
				(
					SELECT
						json_arrayagg(
							JSON_OBJECT(
								'subCategoryId', subQuery.subCategoryId,
								'subCategoryName', subQuery.subCategoryName,
								'requiredSkillLevel', subQuery.avgRequiredSkillLevel,
								'verifiedSkillLevel', subQuery.avgAcquiredLevel,
								'unverifiedSkillLevel', subQuery.avgResumeSkillLevel
							)
						)
					FROM (
						SELECT
							sc.subCategoryId,
							sc.subCategoryName,
							ROUND(AVG(COALESCE(js.requiredSkillLevel, 0)), 2) AS avgRequiredSkillLevel,
							ROUND(AVG(COALESCE(us.acquiredLevel, 0)), 2) AS avgAcquiredLevel,
							ROUND(AVG(COALESCE(us.resumeSkillLevel, 0)), 2) AS avgResumeSkillLevel
						FROM job_skills js
						LEFT JOIN goal_road_maps grm ON grm.skillId = js.skillId
						LEFT JOIN user_skills us ON grm.skillId = us.skillId AND us.userId = :userId
						LEFT JOIN sub_categories sc ON sc.subCategoryId = grm.subCategoryId
						WHERE grm.categoryId = c.categoryId
						${jobId ? `AND js.jobId = ${jobId} AND grm.goalId = ${goalId}` : ``}
						AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
						GROUP BY sc.subCategoryId, sc.subCategoryName
						ORDER BY sc.subCategoryId
					) subQuery
					ORDER BY subQuery.subCategoryId
				) AS subCategoryData,
				(
					SELECT
						json_arrayagg(
							JSON_OBJECT(
								'skillId', uniqueSkills.skillId,
								'skillName', uniqueSkills.skillName,
								'verifiedSkillLevel', uniqueSkills.verifiedSkillLevel,
								'unverifiedSkillLevel', uniqueSkills.unverifiedSkillLevel,
								'requiredSkillLevel', uniqueSkills.requiredSkillLevel,
								'beginnerDescription', uniqueSkills.beginnerDescription,
								'intermediateDescription', uniqueSkills.intermediateDescription,
								'advancedDescription', uniqueSkills.advancedDescription
							)
						)
					FROM (
						SELECT DISTINCT
							s.skillId,
							s.skillName,
							COALESCE(us.acquiredLevel, 0) AS verifiedSkillLevel,
							COALESCE(us.resumeSkillLevel, 0) AS unverifiedSkillLevel,
							COALESCE(js.requiredSkillLevel, 0) AS requiredSkillLevel,
							s.beginnerDescription,
							s.intermediateDescription,
							s.advancedDescription
						FROM job_skills js
						LEFT JOIN goal_road_maps grm ON grm.skillId = js.skillId
						LEFT JOIN user_skills us ON grm.skillId = us.skillId AND us.userId = :userId
						LEFT JOIN skills s ON grm.skillId = s.skillId
						WHERE grm.categoryId = c.categoryId 
						${jobId ? `AND js.jobId = ${jobId} AND grm.goalId = ${goalId}` : ``}
						AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
						ORDER BY s.skillId
					) uniqueSkills
					ORDER BY uniqueSkills.skillId
				) AS skillsData
			FROM job_skills js
			LEFT JOIN goal_road_maps grm ON grm.skillId = js.skillId
			LEFT JOIN user_skills us ON grm.skillId = us.skillId AND us.userId = :userId
			LEFT JOIN skills s ON grm.skillId = s.skillId
			LEFT JOIN sub_categories sc ON sc.subCategoryId = grm.subCategoryId
			LEFT JOIN categories c ON grm.categoryId = c.categoryId
			WHERE (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
			${jobId ? ` AND js.jobId = ${jobId} AND grm.goalId = ${goalId}` : ``} 
			AND c.categoryId IS NOT NULL
			GROUP BY c.categoryId
			ORDER BY c.categoryId;
		`;

		const skillAnalysisData = await sequelize.query(skillAnalysisQuery, {
			replacements: { userId: userId },
			type: sequelize.QueryTypes.SELECT
		});
	
		return { statusCode: 200, status: true, data: { ...candidateAssessmentDetails[0], skillAnalysisData } }
	} catch (error) {
		console.error("Encountered an error while fetching assessment report data: ", error);
		return { statusCode: 500, status: false, message: 'Something went wrong!.' }
	}
};

exports.assessmentReportData = async (req, res, next) => {
	try {
    const { userId } = req.params;
	const { jobId } =  req.query;
    const partnerCode =  req.query.partnerCode;

	const assessmentReportRes = await this.assessmentReportDataFunc(userId, { jobId, partnerCode });

	if (!assessmentReportRes.status) {
		return res.status(assessmentReportRes.statusCode).json({ status: assessmentReportRes.status, message: assessmentReportRes.message });
	}

	return res.status(assessmentReportRes.statusCode).json({ status: assessmentReportRes.status, data: assessmentReportRes.data });
  } catch (error) {
    console.error("Encountered an error while fetching assessment report data: ", error);
    res.status(500).json({status: false, message: "Something went wrong!."});
  }
};

exports.avgTrainingTimeFunc = async (userId) => {
	try {
		let query = `
			SELECT js.jobId, jg.goalId, :userId AS userId, count(js.id) AS missingSkills,
				SUM(
					CASE
						WHEN courseCount > 1 THEN (maxHours + minHours) / 2
						WHEN courseCount = 1 THEN maxHours
						ELSE 0
					END
				) AS learningTimeSkillsInHours
			FROM 
			job_skills js
			JOIN jobs j ON js.jobId = j.jobId
			LEFT JOIN job_goals jg ON jg.jobId = js.jobId
			LEFT JOIN user_skills us ON us.userId = :userId AND js.skillId = us.skillId
			LEFT JOIN user_assessments ua ON ua.userId = :userId AND
				ua.jobId = js.jobId AND
				ua.assessmentStatus = "COMPLETED" AND
				ua.assessmentFeeType = "Sponsored"
			LEFT JOIN (
				SELECT
					cs.skillId,
					COUNT(c.courseId) AS courseCount,
					MAX(c.hours) AS maxHours,
					MIN(c.hours) AS minHours
				FROM course_skills cs
				LEFT JOIN courses c ON cs.courseId = c.courseId
				GROUP BY cs.skillId
			) courseData ON js.skillId = courseData.skillId
			WHERE
				j.isActive = 1 AND
				js.isGoatSkill = true AND
				(
					ua.userId IS NULL
					AND (us.resumeSkillLevel IS NULL OR us.resumeSkillLevel < js.requiredSkillLevel)
					OR ua.userId IS NOT NULL
					AND (us.acquiredLevel IS NULL OR us.acquiredLevel < js.requiredSkillLevel)
				)
    	GROUP BY js.jobId`;
		
		const data = await sequelize.query(query, {
			replacements: { userId },
			type: sequelize.QueryTypes.SELECT
		});

		const updatePromises = data.map(async eachJob => {
			const existingMetrics = await userJobMetrics.findOne({where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId }});
			if (existingMetrics) {
				return userJobMetrics.update(
					{
						missingSkills: eachJob.missingSkills, avgTrainingTime: eachJob.learningTimeSkillsInHours
					},
					{ where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId } }
				);
			} else {
				return userJobMetrics.create({
					missingSkills: eachJob.missingSkills, avgTrainingTime: eachJob.learningTimeSkillsInHours,
					jobId: eachJob.jobId, goalId: eachJob.goalId, userId,
				});
			}
		}
		);

		await Promise.all(updatePromises);

		return { status: true, data: data };
	} catch (error) {
		console.error("Encountered an error while updating user average training time: ", error)
		return { status: false, message: error.message };
	}
};

exports.logisticFitFunc = async (userId, partnerCode) => {
	try {
		let query = `
			SELECT j.jobId, jg.goalId, j.jobLocation,
				CASE
					WHEN JSON_CONTAINS(sp.locations, JSON_QUOTE(j.jobLocation)) OR sp.isRelocate = 1 OR j.modeOfWork = 'Remote' THEN 100
					ELSE 0
				END AS locationMatchPercent,
				CASE WHEN j.jobLocation = s.city THEN 1 ELSE 0 END AS isLocalLocation
			FROM jobs j
			LEFT JOIN job_goals jg ON jg.jobId = j.jobId
            CROSS JOIN students s
			LEFT JOIN student_preferences sp ON sp.userId = s.userId
			WHERE s.userId = :userId AND j.isActive = 1
		`
		if (partnerCode) {
			query += ` AND j.partnerCode = :partnerCode`
		}
		query += `group by j.jobId`
		
		const data = await sequelize.query(query, {
			replacements: { userId },
			type: sequelize.QueryTypes.SELECT
		});

		const updatePromises = data.map(async eachJob => {
			const existingMetrics = await userJobMetrics.findOne({where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId }});
			if (existingMetrics) {
				return userJobMetrics.update(
					{
						locationMatchPercent: eachJob.locationMatchPercent, isLocalLocation: eachJob.isLocalLocation
					},
					{ where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId } }
				);
			} else {
				return userJobMetrics.create({
					locationMatchPercent: eachJob.locationMatchPercent, isLocalLocation: eachJob.isLocalLocation,
					jobId: eachJob.jobId, goalId: eachJob.goalId, userId,
				});
			}
		});

		await Promise.all(updatePromises);

		return { status: true, data: data };
	} catch (error) {
		console.error("Encountered an error while updating logistic fit percentage for the user: ", error)
		return { status: false, message: error.message };
	}
};

exports.financialFitFunc = async (userId, partnerCode) => {
	try {
		let query = `
			SELECT 
			u.userId, j.jobId, jg.goalId, sp.expectedSalary, j.salaryAvg,
			CASE 
				WHEN sp.expectedSalary IS NULL THEN 0
				WHEN sp.expectedSalary <= j.salaryAvg THEN 100
				ELSE (j.salaryAvg / sp.expectedSalary) * 100
			END AS salaryMatchInPercentage
		FROM jobs j
		LEFT JOIN job_goals jg ON jg.jobId = j.jobId
		CROSS JOIN users u
		LEFT JOIN student_preferences sp ON sp.userId = u.userId
		WHERE u.userId = :userId AND j.isActive = 1
		`
		if (partnerCode) {
			query += ` AND j.partnerCode = :partnerCode`
		}
		query += `group by j.jobId`
		
		const data = await sequelize.query(query, {
			replacements: { userId, partnerCode },
			type: sequelize.QueryTypes.SELECT
		});

		const updatePromises = data.map(async eachJob => {
			const existingMetrics = await userJobMetrics.findOne({where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId }});
			if (existingMetrics) {
				return userJobMetrics.update(
					{ salaryMatchInPercentage: eachJob.salaryMatchInPercentage },
					{ where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId } }
				);
			} else {
				return userJobMetrics.create({
					jobId: eachJob.jobId, goalId: eachJob.goalId, userId,
					salaryMatchInPercentage: eachJob.salaryMatchInPercentage
				});
			}
		});

		await Promise.all(updatePromises);
		return { status: true, data: data };
	} catch (error) {
		console.error("Encountered an error while updating financial fit percentage for the user: ", error)
		return { status: false, message: error.message };
	}
};

exports.userExperienceFunc = async (userId, partnerCode) => {
	try {
		let query = `
			SELECT u.userId, j.jobId, jg.goalId,
				(IFNULL(j.minExperienceYears, 0) * 12 + IFNULL(j.minExperienceMonths, 0)) AS jobExperienceInMonths,
				IFNULL(se.experienceInMonths, 0) AS userExperienceInMonths
			FROM  jobs j 
			LEFT JOIN job_goals jg ON jg.jobId = j.jobId
            CROSS JOIN users u 
            LEFT JOIN (
				SELECT
					userId,
					ROUND(SUM(DATEDIFF(COALESCE(endDate, CURDATE()), startDate) / 30.0), 1) AS experienceInMonths
				FROM student_experiences
				WHERE userId = :userId
			) se ON se.userId = u.userId	
			WHERE u.userId = :userId AND j.isActive = 1
		`
		if (partnerCode) {
			query += ` AND j.partnerCode = :partnerCode`
		}

		query += `group by j.jobId`
		
		const data = await sequelize.query(query, {
			replacements: { userId, partnerCode },
			type: sequelize.QueryTypes.SELECT
		});

		const updatePromises = data.map(async eachJob => {
			const existingMetrics = await userJobMetrics.findOne({where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId }});
			if (existingMetrics) {
				return userJobMetrics.update(
					{
						jobExperienceInMonths: eachJob.jobExperienceInMonths,
						userExperienceInMonths: eachJob.userExperienceInMonths,
						experienceMatchInPercentage: (parseInt((eachJob.userExperienceInMonths / eachJob.jobExperienceInMonths) * 100) >= 100) ? 100 : parseInt((eachJob.userExperienceInMonths / eachJob.jobExperienceInMonths) * 100)
					},
					{ where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId } }
				);
			} else {
				return userJobMetrics.create({
					jobExperienceInMonths: eachJob.jobExperienceInMonths,
					userExperienceInMonths: eachJob.userExperienceInMonths,
					experienceMatchInPercentage: (parseInt((eachJob.userExperienceInMonths / eachJob.jobExperienceInMonths) * 100) >= 100) ? 100 : parseInt((eachJob.userExperienceInMonths / eachJob.jobExperienceInMonths) * 100),
					jobId: eachJob.jobId, goalId: eachJob.goalId, userId,
				});
			}
		});

		await Promise.all(updatePromises);

		if (data.length > 0) {
			await students.update({ experienceInMonths: data[0].experienceInMonths }, { where: { userId } });
		}

		return { status: true, data: data };
	} catch (error) {
		console.error("Encountered an error while updating experience fit percentage for the user: ", error)
		return { status: false, message: error.message };
	}
};

exports.careerGapFunc = async (userId) => {
	try {
		let query = `
			SELECT userId, IF(MAX(endDate) < DATE_SUB(CURDATE(), INTERVAL 9 MONTH) AND COUNT(endDate) = COUNT(*), 1, 0) AS careerGap
			FROM student_experiences
			WHERE userId = :userId
		`
		const data = await sequelize.query(query, {
			replacements: { userId },
			type: sequelize.QueryTypes.SELECT
		});

		if (data.length > 0 && data[0].userId) {
			await students.update({ careerGap: data[0].careerGap }, { where: { userId } });
		}
		return { status: true, data: data };
	} catch (error) {
		console.error("Encountere an error while updating career gap for the user: ", error);
		return { status: false, message: error.message };
	}
};

exports.updateUserJobMetricSkills = async (userId, partnerCode) => {
	let query = `
		SELECT  
			j.jobId, g.goalId, COALESCE(ujs_acquired.verifiedSkillsLevelMatchCount, 0) AS verifiedSkillsLevelMatchCount, 
			COALESCE(ujs_acquired.unverifiedSkillsLevelMatchCount, 0) AS unverifiedSkillsLevelMatchCount, 
			COALESCE(js.jobSkillsCount, 0) AS totalJobSkillsCount,
			COALESCE(ujs_acquired.verifiedSkillsMatchCount, 0) AS verifiedSkillsCount,
			COALESCE(ujs_acquired.unverifiedSkillsMatchCount, 0) AS unverifiedSkillsCount,
			COALESCE(IF(js.jobSkillsCount, ROUND((ujs_acquired.verifiedSkillsMatchCount / js.jobSkillsCount) * 100), 0), 0) AS verifiedSkillMatchPercent,
			COALESCE(IF(js.jobSkillsCount, ROUND((ujs_acquired.unverifiedSkillsMatchCount / js.jobSkillsCount) * 100), 0), 0) AS unverifiedSkillMatchPercent,
			COALESCE(IF(js.jobSkillsCount, ROUND((ujs_acquired.verifiedSkillsLevelMatchCount /js.jobSkillsCount) * 100), 0), 0) AS verifiedSkillLevelMatchPercent,
			COALESCE(IF(js.jobSkillsCount, ROUND((ujs_acquired.unverifiedSkillsLevelMatchCount /js.jobSkillsCount) * 100), 0), 0) AS unverifiedSkillLevelMatchPercent,
			COALESCE(IF(js.jobSkillsCount, ROUND((ujs_acquired.unifiedVerifiedSkillLevelMatch /js.requiredSkillLevel) * 100), 0), 0) AS unifiedVerifiedSkillMatchPercent,
			COALESCE(IF(js.jobSkillsCount, ROUND((ujs_acquired.unifiedUnverifiedSkillLevelMatch /js.requiredSkillLevel) * 100), 0), 0) AS unifiedUnverifiedSkillMatchPercent
		FROM job_goals jg
		JOIN goals g ON g.goalId = jg.goalId AND g.isActive = true
		JOIN jobs j ON jg.jobId = j.jobId AND j.isActive = true ${partnerCode ? `AND j.partnerCode = :partnerCode ` : ``}
		LEFT JOIN
			(SELECT jobId, COUNT(id) AS jobSkillsCount, SUM(requiredSkillLevel) as requiredSkillLevel
			FROM job_skills WHERE isGoatSkill = true 
			GROUP BY jobId) js ON js.jobId = j.jobId
		LEFT JOIN
			(SELECT 
				us.userId, js.jobId, 
				SUM(CASE WHEN us.resumeSkillLevel >= 1 THEN 1 ELSE 0 END) AS unverifiedSkillsMatchCount,
				SUM(CASE WHEN us.acquiredLevel >= 1 THEN 1 ELSE 0 END) AS verifiedSkillsMatchCount,
				SUM(CASE WHEN us.resumeSkillLevel >= js.requiredSkillLevel THEN 1 ELSE 0 END) AS unverifiedSkillsLevelMatchCount,
				SUM(CASE WHEN us.acquiredLevel >= js.requiredSkillLevel THEN 1 ELSE 0 END) AS verifiedSkillsLevelMatchCount,
				SUM(IF(us.acquiredLevel >= js.requiredSkillLevel, js.requiredSkillLevel, us.acquiredLevel)) AS unifiedVerifiedSkillLevelMatch,
				SUM(IF(us.resumeSkillLevel >= js.requiredSkillLevel, js.requiredSkillLevel, us.resumeSkillLevel)) AS unifiedUnverifiedSkillLevelMatch,
				SUM(CASE WHEN COALESCE(us.acquiredLevel, 0) = 0 AND COALESCE(us.resumeSkillLevel, 0) = 0 AND js.requiredSkillLevel >= 1 THEN 1 ELSE 0 END) AS missingSkills
			FROM user_skills us
			JOIN job_skills js ON js.skillId = us.skillId
			WHERE js.isGoatSkill = true
			GROUP BY us.userId, js.jobId) ujs_acquired ON ujs_acquired.userId = :userId AND ujs_acquired.jobId = j.jobId;
	`;

	let replacements = {userId};

	if (partnerCode) {
		replacements.partnerCode = partnerCode;
	}

	const updateData = await sequelize.query(query, {
		replacements,
		type: sequelize.QueryTypes.SELECT,
	});

	for(const data of updateData) {
		data.userId = userId;

		const {jobId, goalId} = data;

		const userJobMetricExists = await userJobMetrics.findOne({
			where: {
				userId, jobId, goalId,
			},
		});

		if(userJobMetricExists) {
			await userJobMetrics.update(data, {
				where: {
					userId, goalId, jobId,
				},
			});
		} else {
			await userJobMetrics.create(data);
		}
	}
};

exports.updateCoreSkillPercent = async (userId, partnerCode) => {
	try {
		let query = `
			SELECT ua.userId, ua.jobId, jg.goalId, ROUND(AVG(uar.percentage) * 10) AS coreSkillPercent
			FROM user_assessments ua
			LEFT JOIN user_assessment_sub_category_wise_results uar ON uar.userId = ua.userId 
				AND uar.userAssessmentId = ua.userAssessmentId AND 
				uar.subCategoryName IN ('Coding', 'Algorithms & Data Structures', 'Problem Solving & Logical Reasoning')
			LEFT JOIN job_goals jg ON jg.jobId = ua.jobId
			WHERE ua.userId = :userId AND ua.assessmentStatus = "COMPLETED" AND ua.assessmentFeeType = "Sponsored"
			GROUP BY ua.userId, ua.jobId, jg.goalId
		`;

		const data = await sequelize.query(query, {
			replacements: { userId },
			type: sequelize.QueryTypes.SELECT
		});

		const updatePromises = data.map(async eachJob => {
			const existingMetrics = await userJobMetrics.findOne({ where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId } });
			if (existingMetrics) {
				return userJobMetrics.update(
					{ coreSkillPercent: eachJob.coreSkillPercent },
					{ where: { jobId: eachJob.jobId, goalId: eachJob.goalId, userId } }
				);
			} else {
				return userJobMetrics.create({
					jobId: eachJob.jobId, goalId: eachJob.goalId, userId,
					coreSkillPercent: eachJob.coreSkillPercent
				});
			}
		});

		await Promise.all(updatePromises);
		return { status: true, data: data };
	} catch (error) {
		console.error("Encountered an error while updating core skill percentage for the user: ", error)
		return { status: false, message: error.message };
	}
};

exports.updateUserJobMetricFunc = async (userId) => {
	try {
		const avgTrainingTimeData = await this.avgTrainingTimeFunc(userId);
		const logisticFitData = await this.logisticFitFunc(userId);
		const financialFitData = await this.financialFitFunc(userId);
		const userExperienceData = await this.userExperienceFunc(userId);
		const careerGapData = await this.careerGapFunc(userId);
		const userJobMetricSkillsData = await this.updateUserJobMetricSkills(userId);
		const userCoreSkillPercent = await this.updateCoreSkillPercent(userId);

		return { avgTrainingTimeData, logisticFitData, financialFitData, userExperienceData, careerGapData, userJobMetricSkillsData, userCoreSkillPercent }
	} catch (error) {
		console.error("Encountered an error while updating user job metric skills: ", error)
		return { status: false, message: error.message };
	}
};

exports.test = async (req, res, next) => {
	try {
		const { userId, partnerCode } =  req.query;

		if (userId) {
			var data = await this.updateUserJobMetricFunc(userId);
		} else {
			let users = await userGoals.findAll({
				attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('userId')), 'userId']]
			});

			for (let i = 0; i < users.length; i++) {
				let { userId } = users[i];
				var data = await this.updateUserJobMetricFunc(userId);
				console.log("userId, ", userId)
			}
		}
		
		res.status(200).json({ status: true, data })
  } catch (error) {
    console.error("Encountered an error : ", error);
    res.status(500).json({status: false, message: "Something went wrong!."});
  }
};

exports.updateAvgTrainingTime = async (req, res, next) => {
	try {
		let allData = [];
		let users = await userGoals.findAll({});

		for (let i = 0; i < users.length; i++) {
			let { userId, jobId } = users[i];
			let query = `
			SELECT :userId AS userId, :jobId AS jobId, count(js.id) AS missingSkills,
				SUM(
					CASE
						WHEN courseCount > 1 THEN (maxHours + minHours) / 2
						WHEN courseCount = 1 THEN maxHours
						ELSE 0
					END
				) AS avgTrainingTime
			FROM job_skills js
			LEFT JOIN user_skills us ON us.userId = :userId AND js.skillId = us.skillId
			LEFT JOIN user_assessments ua ON ua.userId = :userId AND
				ua.jobId = js.jobId AND
				ua.assessmentStatus = "COMPLETED" AND
				ua.assessmentFeeType = "Sponsored"
			LEFT JOIN (
				SELECT
					cs.skillId,
					COUNT(c.courseId) AS courseCount,
					MAX(c.hours) AS maxHours,
					MIN(c.hours) AS minHours
				FROM course_skills cs
				LEFT JOIN courses c ON cs.courseId = c.courseId
				GROUP BY cs.skillId
			) courseData ON js.skillId = courseData.skillId
			WHERE
				js.jobId = :jobId AND js.isGoatSkill = true AND
				(
					ua.userId IS NULL
					AND (us.resumeSkillLevel IS NULL OR us.resumeSkillLevel < js.requiredSkillLevel)
					OR ua.userId IS NOT NULL
					AND (us.acquiredLevel IS NULL OR us.acquiredLevel < js.requiredSkillLevel)
				)`;

			const data = await sequelize.query(query, {
				replacements: { userId, jobId },
				type: sequelize.QueryTypes.SELECT
			});

			updateObj = {
				missingSkills: data[0].missingSkills,
				avgTrainingTime: data[0].avgTrainingTime
			}
			
			await userGoals.update(updateObj, {
				where: { userId, jobId }
			});
		}
		res.status(200).send(allData)
	} catch (error) {
		console.error("Encountered an error while updating average training time for user: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.addCandidateJobComment = async (req, res, next) => {
	try {
		let {partnerCode} = req.query;
		let {userId, jobId} = req.params;
		userId = +userId;
		jobId = +jobId;
		const hrId = +req.hrId;

		const {comment} = req.body;

		if(partnerCode && (partnerCode !== req.partnerCode)) {
			return res.status(404).json({status: false, message: "HR not linked with the given partner code."});
		}

		let query = `
			SELECT u.userId, ug.ugId, j.jobId, j.partnerCode, j.isActive
			FROM users u
			LEFT JOIN user_goals ug ON ug.userId = u.userId
			LEFT JOIN jobs j ON j.jobId = ug.jobId
			WHERE u.userId = :userId AND j.jobId = :jobId;
		`;

		const userJobExists = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: {userId, jobId},
		});

		if(!userJobExists.length) {
			return res.status(404).json({status: false, message: "Invalid userId or jobId provided."})
		}

		if(!userJobExists[0]?.isActive) {
			return res.status(403).json({status: false, message: "The job is no longer active."});
		}

		if(partnerCode) {
			if(partnerCode !== userJobExists[0]?.partnerCode) {
				return res.status(403).json({status: false, message: "Job not linked to the given partner code."});
			}
		}

		await hrCandidateJobComments.create({hrId, userId, jobId, comment});

		res.status(200).json({status: true, message: "Comment added successfully."});

	} catch (error) {
		console.error("Encountered an error while adding hr comment: ", error);
		return res.status(500).json({status: false, message: "Something went wrong!"});
	}
};

exports.deleteCandidateJobComment = async (req, res, next) => {
	try {
		const commentId = +req.params.commentId;
		const hrId = +req.hrId;

		const partnerCode = req.query.partnerCode;

		if(partnerCode) {
			if(partnerCode !== req.partnerCode) {
				return res.status(403).json({status: false, message: "HR not linked with the given partner code."});
			}
		}

		const commentExists = await hrCandidateJobComments.findOne({
			where: {
				commentId,
			},
		});

		if(!commentExists) {
			return res.status(404).json({status: false, message: "No such comment found."});
		}

		if(commentExists.hrId !== hrId) {
			return res.status(403).json({status: false, message: "You are not authorized to delete this comment."});
		}

		await hrCandidateJobComments.destroy({
			where: {
				commentId,
			},
		});

		return res.status(200).json({status: true, message: "Comment deleted successfully."});
	} catch (error) {
		console.error("Encountered an error while deleting comment: ", error);
		res.status(500).json({status: false, message: "Something went wrong!"});
	}
};

exports.updateCandidateJobComment = async (req, res, next) => {
	try {
		const commentId = +req.params.commentId;
		const hrId = +req.hrId;

		const {comment} = req.body;

		const partnerCode = req.query.partnerCode;

		if(partnerCode) {
			if(partnerCode !== req.partnerCode) {
				return res.status(403).json({status: false, message: "HR not linked with the given partner code."});
			}
		}

		const commentExists = await hrCandidateJobComments.findOne({
			where: {
				commentId,
			},
		});

		if(!commentExists) {
			return res.status(404).json({status: false, message: "No such comment found."});
		}

		if(commentExists.hrId !== hrId) {
			return res.status(403).json({status: false, message: "You are not authorized to modify this comment."});
		}

		await hrCandidateJobComments.update({comment, isEdited: true}, {
			where: {
				commentId,
			},
		});

		res.status(200).json({status: true, message: "Comment updated successfully."});
	} catch (error) {
		console.error("Encountered an error while updating comment: ", error);
		res.status(500).json({status: false, message: "Something went wrong!"});
	}
};

exports.getAllCandidateJobComments = async (req, res, next) => {
	try {
		let {partnerCode} = req.query;
		let {userId, jobId} = req.params;
		jobId = +jobId;
		userId = +userId;

		if(partnerCode) {
			if(partnerCode !== req.partnerCode) {
				return res.status(404).json({status: false, message: "HR not linked with the given partner code."});
			}
		}

		let query = `
			SELECT u.userId, ug.ugId, j.jobId, j.partnerCode, j.isActive
			FROM users u
			LEFT JOIN user_goals ug ON ug.userId = u.userId
			LEFT JOIN jobs j ON j.jobId = ug.jobId
			WHERE u.userId = :userId AND j.jobId = :jobId;
		`;

		const userJobExists = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: {userId, jobId},
		});

		if(!userJobExists.length) {
			return res.status(404).json({status: false, message: "Invalid userId or jobId provided."})
		}

		if(!userJobExists[0]?.isActive) {
			return res.status(403).json({status: false, message: "The job is no longer active."});
		}

		if(partnerCode) {
			if(partnerCode !== userJobExists[0]?.partnerCode) {
				return res.status(403).json({status: false, message: "Job not linked to the given partner code."});
			}
		}

		let commentsQuery = `
			SELECT hcjc.*, CONCAT(h.firstName, ' ', h.lastName) AS hrName
			FROM hr_candidate_job_comments hcjc
			JOIN hr_managers h ON h.id = hcjc.hrId
			WHERE hcjc.userId = :userId AND hcjc.jobId = :jobId
			ORDER BY hcjc.updatedAt
		`;

		const commentsData = await sequelize.query(commentsQuery, {
			type: sequelize.QueryTypes.SELECT,
			replacements: {userId, jobId},
		});

		res.status(200).json({status: true, data: commentsData});
	} catch (error) {
		console.error("Encountered an error while fetching comments: ", error);
		res.status(500).json({status: false, message: "Something went wrong!"});
	}
};

const createOrUpdateExportConfig = async (hrId, exportOptions) => {
	const hrExportConfigExists = await hrExportConfigs.findOne({
		where: {
			hrId,
		},
	});

	if(Object.keys(exportOptions).length) {
		if(hrExportConfigExists) {
			await hrExportConfigs.update(exportOptions, {
				where: {
					hrId,
				},
			});
		} else {
			exportOptions.hrId = hrId;
			await hrExportConfigs.create(exportOptions);
		}
	}
}

// exports.addHRExportConfig = async (req, res, next) => {
// 	try {
// 		const hrId = req.hrId;

// 		const {exportOptions} = req.body;

// 		await createOrUpdateExportConfig(hrId, exportOptions);

// 		res.status(200).json({status: true, message: "Export configurations for the account added successfully."})
// 	} catch (error) {
// 		console.error("Encountered an error while adding HR export configuration: ", error);
// 		res.status(500).json({status: false, message: "Something went wrong!"});
// 	}
// };

exports.getHRExportConfig = async (req, res, next) => {
	try {
		const hrId = req.hrId;

		let data = await hrExportConfigs.findOne({
			where: {
				hrId,
			},
			attributes: {
				exclude: ['hrId', 'hrExportConfigId', 'createdAt', 'updatedAt'],
			},
		});

		const exportConfigData = data?.dataValues || {};

		res.status(200).json({status: true, exportConfigData});
	} catch (error) {
		console.error("Encountered an error while fetching HR export configuration: ", error);
		res.status(500).json({status: false, message: "Something went wrong!"});
	}
};

exports.updateHRExportConfig = async (req, res, next) => {
	try {
		const hrId = req.hrId;

		const {exportOptions} = req.body;

		await createOrUpdateExportConfig(hrId, exportOptions);

		res.status(200).json({status: true, message: "Export configurations for the account updated successfully."});
	} catch (error) {
		console.error("Encountered an error while updating HR export configuration: ", error);
		res.status(500).json({status: false, message: "Something went wrong!"});
	}
};

exports.deleteHRExportConfig = async (req, res, next) => {
	try {
		const hrId = req.hrId;

		const hrExportConfigExists = await hrExportConfigs.findOne({
			where: {
				hrId,
			},
		});

		if(hrExportConfigExists) {
			await hrExportConfigs.destroy({
				where: {
					hrId,
				},
			});
		}

		res.status(200).json({status: true, message: "Export configuration for this account deleted successfully."});
	} catch (error) {
		console.error("Encountered an error while deleting HR export configuration: ", error);
		res.status(500).json({status: false, message: "Something went wrong!"});
	}
};

exports.updateHRjresumeExportConfig = async (req, res, next) => {
	try {
		const hrId = req.hrId;
		const { userId, jobId, exportOptions } = req.body;

		const hrJResumeExportConfigExists = await hrJResumeExportConfigs.findOne({ where: { hrId, userId, jobId } });
		if (hrJResumeExportConfigExists) {
			await hrJResumeExportConfigs.update(exportOptions, { where: { hrId, userId, jobId } });
		} else {
			await hrJResumeExportConfigs.create({ hrId, userId, jobId, ...exportOptions});
		}

		res.status(200).json({ status: true, message: "JResume export configurations for the account updated successfully." });
	} catch (error) {
		console.error("Encountered an error while updating HR JResume export configuration: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getHRjresumeExportConfig = async (req, res) => {
	try {
		const hrId = req.hrId;

		const { userId, jobId } = req.params;
		const { profileInfo, analytics } = req.query;

		const userData = await users.findOne({ where: { userId } });
		if(!userData) {
			return res.status(400).json({ status: false, message: 'User Not Found.' });
		}
		if(!userData.isActive) {
			return res.status(400).json({ status: false, message: 'User Account Deactivated.' });
		}

		const jobData = await jobs.findOne({ where: { jobId } });
		if(!jobData) {
			return res.status(400).json({ status: false, message: 'Job Not Found.' });
		}
	
		let attributes;
		if (profileInfo) {
			attributes = [
				'candidateReferenceId', 'jobRole', 'jobReferenceId', 'generatedDate', 
				'displayPicture', 'name', 'percentageOfSkillsVerified', 'associatedOrganization', 'stream', 
				'diversityTags', 'email', 'phoneNumber', 'currentCompensation', 'expectedCompensation', 
				'noticePeriod', 'currentLocation', 'workMode', 'relocationPreference', 'profileDetails', 
				'contactInformation', 'compensationDetails', 'locationDetails'
			];
		} else if (analytics) {
			attributes = [
				'cumulativeScore', 'verifiedSkills', 'claimedSkills', 'trainingNeeded', 'logisticFit', 
				'financialFit', 'experienceFit', 'overallSkills', 'technicalSkills', 'appliedTechnicalSkills', 
				'leadershipSkills', 'professionalSkills', 'interpersonalSkills', 'interviewSkills', 
				'fitAnalysis', 'matchAnalysis', 'skillGraph'
			];
		}

		const queryOptions = {
			where: { hrId, userId, jobId },
			attributes: attributes ? attributes : { exclude: ['hrId', 'userId', 'jobId', 'hrExportConfigId', 'createdAt', 'updatedAt'] }
		};
		
		const hrJResumeExportConfig = await hrJResumeExportConfigs.findOne(queryOptions);
		const exportConfigData = hrJResumeExportConfig?.dataValues || {};
		res.status(200).json({ status: true, data: exportConfigData });
	} catch (error) {
		console.error("Encountered an error while fetching HR JResume export configuration: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getHRDashboardMetrics = async (req, res, next) => {
	try {
		const jobId = parseInt(req.query.jobId, 10);
		const partnerCode = req.partnerCode;

		if(isNaN(jobId)) {
			return res.status(400).json({ status: false, message: "Invalid Job Id provided." });
		}

		const validJobExists = await jobs.findOne({
			where: {
				jobId,
			},
			raw: true,
		});

		if(!validJobExists) {
			return res.status(404).json({ status: false, message: "No such job found." });
		}

		if(validJobExists.partnerCode !== partnerCode) {
			return res.status(404).json({ status: false, message: "Job not linked to this partner." });
		}

		if(!validJobExists.isActive) {
			return res.status(400).json({ status: false, message: "Job no longer active." });
		}

		// const data = {
		// 	totalResume: 2935,
		// 	totalWomenResumes: 1898,
		// 	recruitmentMetrics: {
		// 		totalRegisteredCandidates: 252,
		// 		outreachStatus: 238,
		// 		shortlistedCandidates: 32,
		// 		interviewedCandidates: 32,
		// 		hiredCandidates: 15,
		// 	},
		// 	insights: {
		// 		rtw: 80,
		// 		nonRtw: 172,
		// 		activeJobs: 3,
		// 		assessmentTaken: 25
		// 	},
		// 	candidatesQulaificationsSpread: [
		// 		{
		// 			range: '40% - 50%',
		// 			resumeSkills: 1050,
		// 			assessedSkills: 1100
		// 		},
		// 		{
		// 			range: '50% - 60%',
		// 			resumeSkills: 1000,
		// 			assessedSkills: 2050
		// 		},
		// 		{
		// 			range: '60% - 70%',
		// 			resumeSkills: 3050,
		// 			assessedSkills: 4100
		// 		},
		// 		{
		// 			range: '70% - 90%',
		// 			resumeSkills: 3000,
		// 			assessedSkills: 3050
		// 		},
		// 		{
		// 			range: '90% - 100%',
		// 			resumeSkills: 4000,
		// 			assessedSkills: 6050
		// 		}
		// 	],
		// };

		let partnerOverallMetricsExist = await partnerOverallMetrics.findOne({
			where: {
				partnerCode,
			},
			attributes: ['activeJobs', 'totalResumes', 'totalWomenResumes'],
			raw: true,
		});

		if(!partnerOverallMetricsExist) {
			await this.updatePartnerOverallMetrics({partnerCode});
			partnerOverallMetricsExist = await partnerOverallMetrics.findOne({
				where: {
					partnerCode,
				},
				attributes: ['activeJobs', 'totalResumes', 'totalWomenResumes'],
				raw: true,
			});
		}

		let partnerJobMetricsExist = await partnerJobMetrics.findOne({
			where: {
				jobId, partnerCode,
			},
			attributes: ['totalRegisteredCandidates', 'outreachStatus', 'shortlistedCandidates', 'interviewedCandidates', 'hiredCandidates', 'rtw', 'nonRtw', 'assessmentTaken'],
			raw: true,
		});

		if(!partnerJobMetricsExist) {
			await this.updatePartnerJobMetrics({jobId, partnerCode});
			partnerJobMetricsExist = await partnerJobMetrics.findOne({
				where: {
					jobId, partnerCode,
				},
				attributes: ['totalRegisteredCandidates', 'outreachStatus', 'shortlistedCandidates', 'interviewedCandidates', 'hiredCandidates', 'rtw', 'nonRtw', 'assessmentTaken'],
				raw: true,
			});
		}

		let candidateQualificationsSpreadQuery = `
			SELECT
				JSON_OBJECT(
					'assessedSkills', COUNT(CASE WHEN ujm.unifiedVerifiedSkillMatchPercent > 40 AND ujm.unifiedVerifiedSkillMatchPercent <= 50 THEN 1 END),
					'resumeSkills', COUNT(CASE WHEN ujm.unifiedUnverifiedSkillMatchPercent > 40 AND ujm.unifiedUnverifiedSkillMatchPercent <= 50 THEN 1 END)
				) AS '40% - 50%',
				JSON_OBJECT(
					'assessedSkills', COUNT(CASE WHEN ujm.unifiedVerifiedSkillMatchPercent > 50 AND ujm.unifiedVerifiedSkillMatchPercent <= 60 THEN 1 END),
					'resumeSkills', COUNT(CASE WHEN ujm.unifiedUnverifiedSkillMatchPercent > 50 AND ujm.unifiedUnverifiedSkillMatchPercent <= 60 THEN 1 END)
				) AS '50% - 60%',
				JSON_OBJECT(
					'assessedSkills', COUNT(CASE WHEN ujm.unifiedVerifiedSkillMatchPercent > 60 AND ujm.unifiedVerifiedSkillMatchPercent <= 70 THEN 1 END),
					'resumeSkills', COUNT(CASE WHEN ujm.unifiedUnverifiedSkillMatchPercent > 60 AND ujm.unifiedUnverifiedSkillMatchPercent <= 70 THEN 1 END)
				) AS '60% - 70%',
				JSON_OBJECT(
					'assessedSkills', COUNT(CASE WHEN ujm.unifiedVerifiedSkillMatchPercent > 70 AND ujm.unifiedVerifiedSkillMatchPercent <= 80 THEN 1 END),
					'resumeSkills', COUNT(CASE WHEN ujm.unifiedUnverifiedSkillMatchPercent > 70 AND ujm.unifiedUnverifiedSkillMatchPercent <= 80 THEN 1 END)
				) AS '70% - 80%',
				JSON_OBJECT(
					'assessedSkills', COUNT(CASE WHEN ujm.unifiedVerifiedSkillMatchPercent > 80 AND ujm.unifiedVerifiedSkillMatchPercent <= 90 THEN 1 END),
					'resumeSkills', COUNT(CASE WHEN ujm.unifiedUnverifiedSkillMatchPercent > 80 AND ug.unifiedUnverifiedSkillMatchPercent <= 90 THEN 1 END)
				) AS '80% - 90%',
				JSON_OBJECT(
					'assessedSkills', COUNT(CASE WHEN ug.unifiedVerifiedSkillMatchPercent > 90 AND ujm.unifiedVerifiedSkillMatchPercent <= 100 THEN 1 END),
					'resumeSkills', COUNT(CASE WHEN ujm.unifiedUnverifiedSkillMatchPercent > 90 AND ujm.unifiedUnverifiedSkillMatchPercent <= 100 THEN 1 END)
				) AS '90% - 100%'
			FROM user_goals ug
			LEFT JOIN user_job_metrics ujm ON ug.userId = ujm.userId AND ujm.jobId = :jobId
			WHERE ug.jobId = :jobId;
		`;

		let candidateData = await sequelize.query(candidateQualificationsSpreadQuery, {
			type: sequelize.QueryTypes.SELECT,
			replacements: { jobId },
		});

		// constructing response object
		const data = {
			totalResume: partnerOverallMetricsExist.totalResumes,
			totalWomenResumes: partnerOverallMetricsExist.totalWomenResumes,
		};

		data.recruitmentMetrics = {
			totalRegisteredCandidates: partnerJobMetricsExist.totalRegisteredCandidates,
			outreachStatus: partnerJobMetricsExist.outreachStatus,
			shortlistedCandidates: partnerJobMetricsExist.shortlistedCandidates,
			interviewedCandidates: partnerJobMetricsExist.interviewedCandidates,
			hiredCandidates: partnerJobMetricsExist.hiredCandidates,
		};

		data.insights = {
			rtw: partnerJobMetricsExist.rtw,
			nonRtw: partnerJobMetricsExist.nonRtw,
			activeJobs: partnerOverallMetricsExist.activeJobs,
			assessmentTaken: partnerJobMetricsExist.assessmentTaken
		};

		if(!candidateData.length) {
			return res.status(200).json({ status: true, data });
		}

		candidateData = candidateData[0];
		
		const candidatesQualificationsSpread = [];

		Object.keys(candidateData).forEach(key => {
			candidateData[key].range = key;
			candidatesQualificationsSpread.push(candidateData[key]);
		});

		data.candidatesQualificationsSpread = candidatesQualificationsSpread;

		res.status(200).json({ status: true, data });
	} catch (error) {
		console.error("Encountered an error while fetching HR Dashboard Metrics: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.updatePartnerJobMetrics = async (jobData) => {
	try {
		const { jobId, partnerCode } = jobData;
		if(!jobId || !partnerCode) {
			console.error("Job Id and/or Partner Code not provided.");
			return ;
		}

		const validJobExists = await jobs.findOne({
			where: {
				jobId,
			},
		});

		if(!validJobExists) {
			console.error("No such job found.");
			return ;
		}

		if(validJobExists.partnerCode !== partnerCode) {
			console.error(`Job not linked to this partner.`);
			return ;
		}

		if(!validJobExists.isActive) {
			console.error("Job no longer active.");
			return ;
		}
		
		let query = `
			SELECT 
				COUNT(DISTINCT ug.userId) as totalRegisteredCandidates,
				COUNT(DISTINCT CASE WHEN ujs.isShortlisted = 1 AND ujs.status = 'SHORTLISTED' THEN ug.userId END) AS shortlistedCandidates,
				COUNT(DISTINCT CASE WHEN ujs.isHired = 1 AND ujs.status = 'HIRED' THEN ug.userId END) AS hiredCandidates,
				COUNT(DISTINCT CASE WHEN ujs.status = 'INTERVIEWED' THEN ug.userId END) AS interviewedCandidates,
				COUNT(DISTINCT CASE WHEN sp.outReach = 1 THEN ug.userId END) AS outreachStatus,
				COUNT(DISTINCT CASE WHEN s.careerGap = 1 THEN ug.userId END) AS rtw,
				COUNT(DISTINCT CASE WHEN s.careerGap IS NULL OR s.careerGap = 0 THEN ug.userId END) AS nonRtw,
				COUNT(CASE WHEN ua.userAssessmentId IS NOT NULL AND ua.assessmentStatus = 'COMPLETED' THEN 1 END) AS assessmentTaken
			FROM user_goals ug
			JOIN users u ON u.userId = ug.userId AND u.isActive = 1
			JOIN students s ON s.userId = u.userId
			LEFT JOIN student_preferences sp ON sp.userId = s.userId
			LEFT JOIN user_job_status ujs ON ujs.userId = ug.userId AND ujs.jobId = :jobId
			LEFT JOIN user_assessments ua ON ua.userId = ug.userId AND ua.jobId = :jobId
			WHERE ug.jobId = :jobId;
		`;

		let updateValues = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: { jobId, partnerCode },
		});

		if(!updateValues.length) {
			return ;
		}

		updateValues = updateValues[0];

		const partnerJobMetricsExist = await partnerJobMetrics.findOne({
			where: {
				partnerCode, jobId,
			},
		});

		if(!partnerJobMetricsExist) {
			updateValues.jobId = jobId;
			updateValues.partnerCode = partnerCode;
			await partnerJobMetrics.create(updateValues);
		} else {
			await partnerJobMetrics.update(updateValues, {
				where: {
					jobId, partnerCode
				}
			});
		}
	} catch (error) {
		console.error("Encountered an error while updating partner job metrics: ", error);
	}
};

exports.updatePartnerOverallMetrics = async (partnerData) => {
	try {
		const { partnerCode } = partnerData;
		if(!partnerCode) {
			console.error("Partner Code not provided.");
			return ;
		}

		const partnerCodeExists = await partners.findOne({
			where: {
				partnerCode,
			},
		});

		if(!partnerCodeExists) {
			console.error("Invalid Partner Code.");
		}

		let query = `
			SELECT
				COUNT(DISTINCT j.jobId) AS activeJobs,
				COUNT(DISTINCT (CASE WHEN s.resumeFilePath IS NOT NULL THEN s.userId END)) AS totalResumes,
				COUNT(DISTINCT (CASE WHEN s.resumeFilePath IS NOT NULL AND s.gender = 'Female' THEN s.userId END)) AS womenResumes
			FROM user_goals ug
			JOIN users u ON u.userId = ug.userId AND u.isActive = 1
			JOIN students s ON ug.userId = s.userId
			JOIN jobs j ON ug.jobId = j.jobId AND j.isActive = 1 AND j.partnerCode = :partnerCode;
		`;

		let updateValues = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
			replacements: {partnerCode},
		});

		if(!updateValues.length) {
			return ;
		}

		updateValues = updateValues[0];

		const partnerOverallMetricsExist = await partnerOverallMetrics.findOne({
			where: {
				partnerCode,
			},
		});

		if(!partnerOverallMetricsExist) {
			updateValues.partnerCode = partnerCode;
			await partnerOverallMetrics.create(updateValues);
		} else {
			partnerOverallMetrics.update(updateValues, {
				where: {
					partnerCode,
				},
			});
		}
	} catch (error) {
		console.error("Encountered an error while updating partner metrics: ", error);
	}
};