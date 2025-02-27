
const curriculumType = require("../models/curriculumType")
const curriculums = require("../models/curriculums");
const courses = require("../models/courses");
const materials = require("../models/materials");
const skills = require("../models/skills");
const goals = require("../models/goals");
const { jobs } = require("../models/jobs");
const userCourses = require("../models/userCourses");
const goalRoadmap = require("../models/goalRoadmap");
const jobCourses = require("../models/jobCourses");
const slugify = require('slugify');
const sequelize = require('../util/dbConnection');
const { Op } = require('sequelize');

exports.getJobs = async (req, res, next) => {
    try {
        const filters = {
            workPreference: req.query.workPreference,
            employmentType: req.query.employmentType,
            jobSeniority: req.query.jobSeniority,
        };

        const salaryRange = {
            from: req.query.salaryFrom,
            to: req.query.salaryTo,
        };

        const whereClause = { isActive: true };
        if (filters.workPreference) {
            whereClause.workPreference = filters.workPreference;
        }
        if (filters.employmentType) {
            whereClause.employmentType = filters.employmentType;
        }
        if (filters.jobSeniority) {
            whereClause.jobSeniority = filters.jobSeniority;
        }
        whereClause.salaryFrom = {
            [Op.gte]: salaryRange.from || 0,
        };
        whereClause.salaryTo = {
            [Op.lte]: salaryRange.to || 99999999,
        };

        const queryOptions = {
            where: whereClause,
            attributes: ['jobId', 'jobTitle', 'startDate', 'endDate', 'lastDateOfApply', 'jobLocation'],
        };


        const resultjobs = await jobs.findAll(queryOptions);

        // get userId from token
        const userId = 1;
        const userData = userCourses.findAll({ where: { userId } });

        // for ()
        //     console.log(resultjobs[0].dataValues);
        const message = "Data Send successful";
        return res.status(200).json({
            success: true,
            message,
            result: resultjobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};