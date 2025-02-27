const sequelize = require('../util/dbConnection');
const { Op, where } = require('sequelize');

const userAssessments = require("../models/userAssessments");
const userCertificates = require("../models/userCertificates");
const userGoals = require("../models/userGoals");
const users = require('../models/users');
const userCourses = require('../models/userCourses');
const students = require('../models/students');
const roles = require('../models/roles');
const moment = require("moment");
const goals = require('../models/goals');
moment.tz.setDefault("Asia/Calcutta");

exports.personalizedUsersCount = async (req, res, next) => {
    try {
      const {startDate, endDate } = req.query;

      const whereConditions = {};

      if (startDate && endDate) {
        whereConditions.createdAt = { [Op.between]: [ moment(startDate).startOf('day').toDate(), moment(endDate).endOf('day').toDate() ] };
      } else {
        if (startDate) {
          whereConditions.createdAt = { [Op.gte]: moment(startDate).startOf('day').toDate() };
        }
        if (endDate) {
          whereConditions.createdAt = { [Op.lte]: moment(endDate).endOf('day').toDate() };
        }
      }

      const personalizedRoadmapsCount = await userGoals.count({ distinct: true, col: 'userId', where: whereConditions, });
  
      res.status(200).json({ status: true, data: { personalizedUsersCount: personalizedRoadmapsCount } });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ status: false, message: "Unable to fetch personalized roadmaps count." });
    }
};

exports.getCertificateCount = async (req, res, next) => {
    try {
      const { userId, startDate, endDate } = req.query;

      let whereCondition = { }
      if (userId) {
        whereCondition.userId = userId
      }

      if (startDate && endDate) {
        whereCondition.createdAt = { [Op.between]: [ moment(startDate).startOf('day').toDate(), moment(endDate).endOf('day').toDate() ] };
      } else {
          if (startDate) {
            whereCondition.createdAt = { [Op.gte]: moment(startDate).startOf('day').toDate() };
          }
          if (endDate) {
            whereCondition.createdAt = { [Op.lte]: moment(endDate).endOf('day').toDate() };
          }
      }

      const certificateCount = await userCertificates.count({ where: whereCondition });
  
      return res.status(200).json({ status: true, certificateCount });
    } catch(error) {
      console.error("Unable to fetch certificate count! ", error);
      return res.status(500).json({ status: false, message: "Internal Server Error." });
    }
}

exports.postRoadmapCompletion = async (req, res, next) => {
    try {
      const { userId, startDate, endDate } = req.query;
      let whereCondition = `WHERE assessmentType = 'postRoadmap'`;

      if (userId) {
        whereCondition += ` AND userId = ${userId}`;
      }
    
      if (startDate || endDate) {
        if (startDate && endDate) {
            whereCondition += ` AND createdAt BETWEEN '${moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')}' AND '${moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')}'`;
        } else if (startDate) {
            whereCondition += ` AND createdAt >= '${moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')}'`;
        } else if (endDate) {
            whereCondition += ` AND createdAt <= '${moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')}'`;
        }
      }
      const query = `
        SELECT 
          COUNT(*) AS totalPostRoadmapAssessments,
          SUM(CASE WHEN assessmentStatus = 'COMPLETED' THEN 1 ELSE 0 END) AS completedPostRoadmapAssessments
        FROM user_assessments
        ${whereCondition}
      `;
  
      const data = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
      });
  
      const totalAssessments = data[0].totalPostRoadmapAssessments || 0;
      const completedAssessments = data[0].completedPostRoadmapAssessments || 0;
      
      const completionPercentage = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
  
      const result = {
        totalPostRoadmapAssessments: totalAssessments,
        completedPostRoadmapAssessments: completedAssessments,
        completionPercentage: parseFloat(completionPercentage.toFixed(2))
      };
  
      return res.status(200).json({ status: true, data: result });
    } catch (error) {
      console.error("Unable to fetch assessments count data", error);
      return res.status(500).json({ status: false, message: "Internal Server Error." });
    }
};

exports.averageAssessmentScores = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;

      let dateCondition = '';
      if (startDate || endDate) {
          if (startDate && endDate) {
              dateCondition += ` AND ua.createdAt BETWEEN '${moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')}' AND '${moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')}'`;
          } else if (startDate) {
              dateCondition += ` AND ua.createdAt >= '${moment(startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')}'`;
          } else if (endDate) {
              dateCondition += ` AND ua.createdAt <= '${moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')}'`;
          }
      }

        const query = `
            SELECT ua.assessmentCategory,
                MAX(JSON_UNQUOTE(JSON_EXTRACT(twd.data, '$.avgScorePercentage'))) AS avgScorePercentage
            FROM user_assessments ua
            JOIN testlify_webhook_details twd
            ON ua.testlifyAssessmentEmail = twd.testlifyAssessmentEmail
            AND ua.assessmentId = twd.assessmentId
            WHERE ua.assessmentStatus = 'COMPLETED'
            AND twd.status = 'COMPLETED'
            ${dateCondition}
            GROUP BY ua.jobAssessmentId, ua.userId, ua.assessmentCategory
        `;

        const data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

        const categoryScores = {};
        data.forEach(item => {
            const category = item.assessmentCategory || 'Pre-Roadmap';
            const score = parseFloat(item.avgScorePercentage);

            if (!categoryScores[category]) {
                categoryScores[category] = { totalScore: 0, count: 0 };
            }

            categoryScores[category].totalScore += score;
            categoryScores[category].count += 1;
        });

        const result = Object.keys(categoryScores).map(category => ({
            assessmentCategory: category,
            avgScorePercentage: (categoryScores[category].totalScore / categoryScores[category].count).toFixed(2)
        }));

        const preRoadmapData = result.find(item => item.assessmentCategory == "Pre-Roadmap");
        const otherData = result.filter(item => item.assessmentCategory != "Pre-Roadmap");
        const postRoadmapAvg = otherData.reduce((sum, item) => sum + parseFloat(item.avgScorePercentage), 0) / otherData.length;
        const improvement = preRoadmapData ? postRoadmapAvg - parseFloat(preRoadmapData.avgScorePercentage) : 0;

        let dataFormate = [ ...result,
          { "assessmentCategory": "Post-Roadmap", "avgScorePercentage": postRoadmapAvg.toFixed(2) },
          { "assessmentCategory": "Pre To Post Improvement", "avgScorePercentage": improvement.toFixed(2) }
        ]

        return res.status(200).json({ status: true, data: dataFormate });
    } catch (error) {
        console.error("Error calculating average scores:", error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
};


exports.getNewUserRegistrations = async (req, res, next) => {
  try {
    const whereCondition = {};
    if(req.query) {
      if(req.query.startDate) {
        const start = new Date(req.query.startDate);
        if(isNaN(start.getTime())) {
          return res.status(400).json({status: false, message: 'Invalid date format!'});
        }
        whereCondition['createdAt'] = { [Op.gte]: start };
      }

      if(req.query.endDate) {
        const end = new Date(req.query.endDate);
        if(isNaN(end.getTime())) {
          return res.status(400).json({status: false, message: 'Invalid date format!'});
        }
        if (whereCondition['createdAt']) {
          whereCondition['createdAt'][Op.lte] = end;
        } else {
          whereCondition['createdAt'] = { [Op.lte]: end };
        }
      }
    }

    const roleIds = await roles.findAll({
      where: {
        roleName: {
          [Op.or]: ['Student', 'HR']
        }
      }
    });

    const studentRoleId = roleIds.find(role => role.roleName === 'Student')?.roleId || null;
    const hrRoleId = roleIds.find(role => role.roleName === 'HR')?.roleId || null;


    if(!studentRoleId || !hrRoleId) {
      console.error("Role(s) not found.")
    }

    // query to get new user registrations(hr, student, total)
    query = `
      SELECT
        COUNT(u.userId) AS totalCount,
        SUM(CASE WHEN ur.roleId = ${studentRoleId} THEN 1 ELSE 0 END) AS studentCount,
        SUM(CASE WHEN ur.roleId = ${hrRoleId} THEN 1 ELSE 0 END) AS hrCount
      FROM users u
      JOIN user_roles ur
        ON u.userId = ur.userId
      JOIN (
        SELECT userId, MAX(createdAt) AS latestRoleTime
        FROM user_roles
        GROUP BY userId
      ) latestRoles
        ON ur.userId = latestRoles.userId
        AND ur.createdAt = latestRoles.latestRoleTime
    `;

    const newUserRegistrationsCount = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
      
    const counts = newUserRegistrationsCount[0] || {};

    // const { totalCount = 0, hrCount = 0, studentCount = 0 } = counts;

    const totalCount = +(counts.totalCount || 0);
    const hrCount = +(counts.hrCount || 0);
    const studentCount = +(counts.studentCount || 0);

    return res.status(200).json({status: true, totalCount, hrCount, studentCount});
  } catch(err) {
    console.error(err);
    res.status(500).json({status: false, message: 'Something went wrong!'});
  }
};

exports.getProfileMetrics = async (req, res, next) => {
  try {
    let query = `
    SELECT 
      u.userId, s.firstName, s.lastName, s.country, s.state, s.city, s.address, s.postalCode, 
      u.email, u.phoneNumber, u.profilePicture, s.resumeFilePath,
      CASE WHEN COUNT(se.educationId) > 0 THEN 1 ELSE 0 END AS education,
      CASE WHEN COUNT(sx.experienceId) > 0 THEN 1 ELSE 0 END AS experience,
      CASE WHEN COUNT(uc.courseId) > 0 THEN 1 ELSE 0 END AS course
    FROM 
      users u
    JOIN 
      students s ON u.userId = s.userId
    LEFT JOIN 
      education_histories se ON u.userId = se.userId
    LEFT JOIN 
      student_experiences sx ON u.userId = sx.userId
    LEFT JOIN 
      user_courses uc ON u.userId = uc.userId
    GROUP BY 
      u.userId, s.firstName, s.lastName, s.country, s.address, s.state, s.city, s.postalCode, 
      u.email, u.phoneNumber, u.profilePicture, s.resumeFilePath
    ORDER BY 
      u.userId;
    `;

    const profiles = await sequelize.query(query, {type: sequelize.QueryTypes.SELECT});
    const totalStudents = profiles.length;

    const individualFieldsToCheck = ['firstName', 'lastName', 'email', 'phoneNumber', 'address', 'city', 'country', 'state', 'postalCode', 'resumeFilePath', 'profilePicture'];

    const sectionFieldsToCheck = ['education', 'course', 'experience']

    let countProfileCompleted = 0;
    let countResumeUploaded = 0;
    let countWorkHistoryAdded = 0;
    let countEducationAdded = 0;

    profiles.forEach(profile => {
      let countCompletedIndividualFields = 0;
      let countCompletedSectionFields = 0;
      individualFieldsToCheck.forEach(field => {
        if (profile[field]) {
          if(field === 'resumeFilePath') {
            countResumeUploaded++;
          }
          countCompletedIndividualFields++;
        }
      });

      sectionFieldsToCheck.forEach(field => {
        if (profile[field]) {
          if(field === 'education') {
            countEducationAdded++;
          } else if(field === 'experience') {
            countWorkHistoryAdded++;
          }
          countCompletedSectionFields++;
        }
      });

      const totalPercent = Math.floor((countCompletedIndividualFields  + countCompletedSectionFields * individualFieldsToCheck.length) * 100 / (4 * individualFieldsToCheck.length)); 

      if(totalPercent == 100) {
          countProfileCompleted++;
      }
    });
    const percentageProfileCompleted = parseFloat((countProfileCompleted * 100 / totalStudents).toFixed(2));
    const percentageWorkHistoryAdded = parseFloat((countWorkHistoryAdded * 100 / totalStudents).toFixed(2));
    const percentageEducationAdded = parseFloat((countEducationAdded * 100 / totalStudents).toFixed(2));
    const percentageResumeUploaded = parseFloat((countResumeUploaded * 100 / totalStudents).toFixed(2));

    res.status(200).json({status: true, percentageEducationAdded, percentageProfileCompleted, percentageResumeUploaded, percentageWorkHistoryAdded});
  } catch(err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something when wrong!'
    });
  }
};

exports.getAverageSkillPerUser = async (req, res, next) => {
    try {
      const totalStudents = await students.count();
      const totalSkillsAdded = await userCourses.count();
      const avgSkillPerUser = totalSkillsAdded / totalStudents;
      return res.status(200).json({status: true, averageSkillPerUser: avgSkillPerUser.toFixed(2)});
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false, message: 'Something went wrong!'
    });
  }
};

exports.getAssessmentRevenue = async (req, res, next) => {
  try {
    const whereConditions = [];
    const replacements = [];

    if(req.query) {
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ua.updatedAt >= ?');
        replacements.push(start.toISOString());
      }

      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ua.updatedAt <= ?');
        replacements.push(end.toISOString());
      }
    }

    // whereConditions.push("ua.assessmentType = 'preRoadmap'");
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    let query = `
    SELECT
      SUM(CASE WHEN t.assessmentType = 'preRoadmap' AND t.assessmentFeeType = 'PAID' THEN t.finalAmount ELSE 0 END) AS paidPreSum,
      SUM(CASE WHEN t.assessmentType = 'preRoadmap' AND t.assessmentFeeType = 'SPONSORED' THEN t.finalAmount ELSE 0 END) AS sponsoredPreSum,
      SUM(CASE WHEN t.assessmentType = 'postRoadmap' AND t.assessmentFeeType = 'PAID' THEN t.finalAmount ELSE 0 END) AS paidPostSum,
      SUM(CASE WHEN t.assessmentType = 'postRoadmap' AND t.assessmentFeeType = 'SPONSORED' THEN t.finalAmount ELSE 0 END) AS sponsoredPostSum
    FROM
      (SELECT 
        p.paymentId,
        p.updatedAt,
        ua.assessmentType,
        ua.assessmentFeeType,
        p.finalAmount
      FROM 
        user_assessments ua
      LEFT JOIN 
        payments p ON p.paymentId = ua.paymentId
      ${whereClause}
      GROUP BY 
        p.paymentId,
        ua.assessmentType,
        p.finalAmount
      ) t;
    `;

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const { paidPreSum, sponsoredPreSum, paidPostSum, sponsoredPostSum } = results[0];
    const preAssessmentRevenue = {
      total: (paidPreSum + sponsoredPreSum),
      paid: paidPreSum,
      sponsored: sponsoredPreSum
    };

    const postAssessmentRevenue = {
      total: (paidPostSum + sponsoredPostSum),
      paid: paidPostSum,
      sponsored: sponsoredPostSum
    };

    res.status(200).json({
      status: true,
      preAssessmentRevenue: paidPreSum,
      postAssessmentRevenue: paidPostSum
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!'
    });
  }
};

exports.getJobListingsViewed = async (req, res, next) => {
  try {
    const whereConditions = [];
    const replacements = [];

    if(req.query) {
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ual.createdAt >= ?');
        replacements.push(start.toISOString());
      }

      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ual.createdAt <= ?');
        replacements.push(end.toISOString());
      }
    }

    // whereConditions.push("path REGEXP '^/api/v1/student/getRoadmaps/[0-9]+($|\\\\?)'");

    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    let query = `
    SELECT 
      COUNT(DISTINCT CASE WHEN ual.path REGEXP '^/api/v1/student/getRoadmaps/[0-9]+($|\\\\?)' THEN userId END) AS userCount,
      COUNT(CASE WHEN ual.path REGEXP '^/api/v1/student/getRoadmaps/[0-9]+($|\\\\?)' THEN 1 END) AS totalCount,
      COUNT(CASE WHEN ual.path REGEXP '^/api/v1/student/getJobAssessments/[0-9]+($|\\\\?)' THEN 1 END) as identifySkillGapClicks
    FROM 
      user_activity_logs ual
    ${whereClause};
    `;

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT
    });

    // count currently active job listings
    const currentActiveJobs = await goals.count({
      where: {
        isActive: 1
      }
    });

    const userCount = results[0].userCount;
    const totalCount = results[0].totalCount;
    const identifySkillGapClicks = results[0].identifySkillGapClicks;

    const jobListingsViewedPerUser = parseFloat((totalCount / userCount).toFixed(2));

    res.status(200).json({
      status: true,
      userCount,
      totalCount,
      jobListingsViewedPerUser,
      identifySkillGapClicks,
      currentActiveJobs
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!'
    });
  }
};


exports.getPreAssessmentStats = async (req, res, next) => {
  try {
    const whereConditions = [];
    const replacements = [];

    if(req.query) {
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ua.updatedAt >= ?');
        replacements.push(start.toISOString());
      }

      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ua.updatedAt <= ?');
        replacements.push(end.toISOString());
      }
    }

    whereConditions.push("ua.assessmentType = 'preRoadmap'");

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    let query = `
    SELECT
      COUNT(CASE WHEN ua.assessmentStatus = 'INVITED' THEN 1 END) AS initiatedCount,
      COUNT(CASE WHEN ua.assessmentStatus = 'COMPLETED' THEN 1 END) AS completedCount,
      COUNT(CASE WHEN ua.assessmentFeeType = 'PAID' THEN 1 END) AS selfFunded,
      COUNT(CASE WHEN ua.assessmentFeeType = 'SPONSORED' THEN 1 END) as sponsored,
      COUNT(*) AS totalCount
    FROM
      user_assessments ua
    ${whereClause};
    `;

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const preAssessmentsInitiated = results[0].initiatedCount;
    const preAssessmentCompletionPercentage = (results[0].completedCount * 100 / results[0].totalCount).toFixed(2);
    const sponsoredPreAssessments = results[0].sponsored;
    const selfFundedPreAssessments = results[0].selfFunded;

    res.status(200).json({
      status: true,
      preAssessmentsInitiated,
      preAssessmentCompletionPercentage,
      selfFundedPreAssessments,
      sponsoredPreAssessments
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!'
    });
  }
};


exports.getPreAssessmentScore = async (req, res, next) => {
  try {
    const whereConditions = [];
    const replacements = [];
    
    if(req.query) {
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ua.updatedAt >= ?');
        replacements.push(start.toISOString());
      }

      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ua.updatedAt <= ?');
        replacements.push(end.toISOString());
      }
    }
    whereConditions.push("ua.assessmentStatus = 'COMPLETED'");
    whereConditions.push("twd.status = 'COMPLETED'");
    whereConditions.push("ua.assessmentType = 'preRoadmap'");

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    let query = `
    SELECT
      JSON_EXTRACT(twd.data, '$.totalScore') AS score,
      JSON_EXTRACT(twd.data, '$.testLibrary[0].skills') AS skillScore,
      ua.assessmentType,
      ua.assessmentStatus,
      ua.testlifyAssessmentEmail
    FROM
      user_assessments ua
    JOIN
      testlify_webhook_details twd
    ON
      ua.testlifyAssessmentEmail = twd.testlifyAssessmentEmail AND ua.assessmentId = twd.assessmentId
    ${whereClause}
    GROUP BY 
      ua.jobAssessmentId, ua.userId, ua.assessmentCategory;
    `;

    const results = await sequelize.query(query, {
      replacements: replacements,
      type: sequelize.QueryTypes.SELECT
    });

    let totalScore = 0;
    let assessmentCount = 0;
    let skillMap = new Map();
    
    results.forEach(result => {
      totalScore += result.score;
      assessmentCount++;
      const skills = result.skillScore;
      skills.forEach(skill => {
        if (skill.description) {
          let description = skill.description.split('_')[0];

          if (skillMap.has(description)) {
            let skillData = skillMap.get(description);
            skillData.totalSkillQuestion += skill.totalSkillQuestion;
            skillData.totalCorrectSkillQuestion += skill.totalCorrectSkillQuestion;
            skillMap.set(description, skillData);
          } else {
            skillMap.set(description, {
              totalSkillQuestion: skill.totalSkillQuestion,
              totalCorrectSkillQuestion: skill.totalCorrectSkillQuestion
            });
          }
        }
      });
    });

    skillMap.forEach((values, key) => {
      const totalSkillQuestion = values.totalSkillQuestion;
      const totalCorrectQuestion = values.totalCorrectSkillQuestion;
      let percentage = 0;
      if(totalSkillQuestion && totalCorrectQuestion) {
        percentage = parseFloat((totalCorrectQuestion * 100 / totalSkillQuestion).toFixed(2));
      }
      skillMap.set(key, {
        percentage: percentage
      });
    });
    
    res.status(200).json({
      status: true,
      averageScore: parseFloat((totalScore / assessmentCount).toFixed(2)),
      skillMap: Object.fromEntries(skillMap)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!'
    });
  }
};


// platform usage
exports.getActiveUsers = async (req, res, next) => {
  try {
    const whereConditions = [];
    const replacements = [];
    
    if(req.query) {
      if (req.query.startDate) {
        const start = new Date(req.query.startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ual.createdAt >= ?');
        replacements.push(start.toISOString());
      } else {
        start = new Date();
        start.setHours(0, 0, 0, 0);
        whereConditions.push('ual.createdAt >= ?');
        replacements.push(start.toISOString());
      }

      if (req.query.endDate) {
        const end = new Date(req.query.endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ status: false, message: 'Invalid date format!' });
        }
        whereConditions.push('ual.createdAt <= ?');
        replacements.push(end.toISOString());
      } else {
        const end = new Date();
        whereConditions.push('ual.createdAt <= ?');
        replacements.push(end.toISOString());
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // find role ids for various roles
    const roleIds = await roles.findAll({
      where: {
        roleName: {
          [Op.or]: ['Student', 'HR']
        }
      }
    });

    const studentRoleId = roleIds.find(role => role.roleName === 'Student')?.roleId || null;
    const hrRoleId = roleIds.find(role => role.roleName === 'HR')?.roleId || null;


    if (!studentRoleId || !hrRoleId) {
      console.error("Role(s) not found.")
    }
    
    let query = `
    SELECT
      SUM(CASE WHEN t.roleId = ${studentRoleId} THEN 1 ELSE 0 END) AS activeStudents,
      SUM(CASE WHEN t.roleId = ${hrRoleId} THEN 1 ELSE 0 END) AS activeHR
    FROM
    (
      SELECT DISTINCT ual.userId, ur.roleId
      FROM jcurve_db.user_activity_logs ual
      JOIN (
        SELECT ur.userId, ur.roleId
        FROM user_roles ur
        JOIN (
          SELECT userId, MAX(createdAt) AS latestRole
          FROM user_roles
          GROUP BY userId
        ) latest_roles ON ur.userId = latest_roles.userId AND ur.createdAt = latest_roles.latestRole
      ) ur ON ual.userId = ur.userId
    ) t;
`;

    const results = await sequelize.query(query, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    let { activeStudents, activeHR } = results[0];
    activeStudents = +activeStudents;
    activeHR = +activeHR;
    
    res.status(200).json({
      status: true,
      activeStudents,
      activeHR
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!'
    });
  }
};