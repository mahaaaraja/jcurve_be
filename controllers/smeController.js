const questions = require("../models/questions");
const { paginateResults } = require("../util/pagination");
const skills = require("../models/skills");
const skillQuestions = require("../models/skillQuestions");
const sequelize = require('../util/dbConnection');

const createUpdateObj = (data) => {
	const updateObj = {};
	Object.keys(data).forEach(key => {
		if(typeof data[key] === 'string' && data[key].trim().length) {
			updateObj[key] = data[key].trim();
		} else if(typeof data[key] === 'number' && data[key] >= 0) {
			updateObj[key] = data[key];
		}
	})

	return updateObj;
};

exports.updateQuestion = async (req, res, next) => {
	try {
		const questionId = parseInt(req.params.questionId, 10);
		const {questionData} = req.body;

		const questionExists = await questions.findOne({ where: { questionId } });
		if (!questionExists) {
			return res.status(404).json({ status: false, message: 'Question not found.' });
		}
		if(questionData) {
			const updateObj = createUpdateObj(questionData);
		  await questions.update(updateObj, { where: { questionId } });
		}
		
		res.status(200).json({ status: true, message: "Question updated successfully." });
	} catch (error) {
		console.error("Encountered an error while updating question: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.updateQuestionSkillLevel = async (req, res, next) => {
	try {
		const skillQuestionId = parseInt(req.params.skillQuestionId, 10);
		const skillLevel = parseInt(req.body.skillLevel, 10);

		// if skillLevel is not provided or is < 0, respond with error message
		if(!skillLevel || skillLevel < 0) {
			return res.status(400).json({ status: false, message: "Skill level must be greater than or equal to 0." });
		}

		const skillQuestionExists = await skillQuestions.findOne({
			where: {
				skillQuestionId
			},
		});

		// if no mapping found, validate questionId and skillId and create mapping.
		if(!skillQuestionExists) {
			return res.status(404).json({ status: false, message: "No such skill-question link found." })
		}

		await skillQuestions.update({skillLevel}, {
			where: {
				skillQuestionId
			},
		});
		
		res.status(200).json({ status: true, message: "Question skill level updated successfully." });
	} catch (error) {
		console.error("Encountered an error while updating question skill level: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getAllQuestions = async (req, res, next) => {
	try {
		let { skillId, skillLevel } = req.query;

		skillId = parseInt(skillId, 10);
		skillLevel = parseInt(skillLevel, 10);

		let replacements = {};
		let dataQuery = `
			SELECT 
				*
			FROM questions q`
		;

		let countQuery = `
			SELECT 
				COUNT(DISTINCT q.questionId)
			FROM questions q`
		;

		if(skillId || skillLevel) {
			dataQuery += `
				JOIN skill_questions sq
				WHERE 1 = 1`
			;

			countQuery += `
				JOIN skill_questions sq
				WHERE 1 = 1`
			;
		}

		if(skillId) {
			dataQuery += ` AND sq.skillId = :skillId`;
			countQuery += ` AND sq.skillId = :skillId`;
			replacements.skillId = skillId;
		}

		if(skillLevel) {
			dataQuery = ` AND sq.skillLevel = :skillLevel`;
			countQuery += ` AND sq.skillLevel = :skillLevel`;
			replacements.skillLevel = skillLevel;
		}

		const {data, totalRecords, totalPages, currentPage, limit} = await paginateResults(req, countQuery, replacements, dataQuery, replacements);
		
		if(totalRecords) {
			return res.status(200).json({ status: true, data, totalRecords, totalPages, currentPage, limit });
		}
		
		res.status(200).json({status: true, data});
	} catch (error) {
		console.error("Encountered an error while fetching questions: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.getQuestion = async (req, res, next) => {
	try {
		let { questionId } = req.params
		questionId = Number(questionId);

		const questionExists = await questions.findOne({
			where: {
				questionId
			},
		});

		if(!questionExists) {
			return res.status(404).json({ status: false, message: "Question not found." });
		}

		const skillsLinkedWithQuestion = await skillQuestions.findAll({
			where: {
				questionId
			},
		});

		res.status(200).json({ status: true, questionData: questionExists, skillQuestions: skillsLinkedWithQuestion });
	} catch (error) {
		console.error("Encountered an error while fetching question: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

const beautifyQuestionData = (data) => {
	let beautifiedObj = {};
	Object.keys(data).forEach(key => {
		beautifiedObj[key] = data[key]?.trim();
	})

	return beautifiedObj;
};

exports.addQuestions = async (req, res, next) => {
	try {
		let {questionsArray} = req.body;

		let validQuestions = [], invalidQuestions = [];
		questionsArray.forEach(questionData => {
			let {questionType, marks, isApproved, ...data} = questionData;

			if(data?.question?.trim()?.length && data?.answer?.trim()?.length) {
				const trimmedData = beautifyQuestionData(data);
				if(questionType) {
					trimmedData.questionType = questionType;
				}
				if(marks) {
					trimmedData.marks = marks;
				}
				if(isApproved) {
					trimmedData.isApproved = isApproved;
				}

				validQuestions.push(trimmedData);
			} else {
				invalidQuestions.push(questionData);
			}
		})

		if(validQuestions.length) {
			await questions.bulkCreate(validQuestions)
		}

		return res.status(200).json({ status: true, insertedQuestions: validQuestions, skippedQuestions: invalidQuestions });
	} catch (error) {
		console.error("Encountered an error while adding question(s): ", error);
		res.status(500).json({ status: false, message: "Something went wrong!"});
	}
};

exports.addQuestionSkill = async (req, res, next) => {
	try {
		const skillId = parseInt(req.params.skillId, 10);
		const questionId = parseInt(req.params.questionId, 10);
		const skillLevel = parseInt(req.body.skillLevel, 10);

		const skillExists = await skills.findOne({
			where: {
				skillId
			},
		});

		if(!skillExists) {
			return res.status(404).json({ status: false, message: "Skill not found." });
		}

		const questionExists = await questions.findOne({
			where: {
				questionId
			},
		});

		if(!questionExists) {
			return res.status(404).json({ status: false, message: "Question not found." });
		}

		const createObj = {questionId, skillId};

		if(!skillLevel) {
			createObj.skillLevel = 5; // beginner default
		} else {
			createObj.skillLevel = skillLevel;
		}

		const skillQuestionExists = await skillQuestions.findOne({
			where: createObj,
		});

		if(skillQuestionExists) {
			return res.status(400).json({ status: false, message: "Question already linked to skill level." });
		}

		await skillQuestions.create(createObj);

		res.status(200).json({ status: true, message: "Question successfully linked with skill level." });
	} catch (error) {
		console.error("Encountered an error while linking skill with question: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.deleteQuestion = async (req, res, next) => {
	try {
		let {questionId} = req.params;
		questionId = parseInt(questionId, 10);

		const questionExists = await questions.findOne({
			where: {
				questionId
			},
		});

		if(!questionExists) {
			return res.status(404).json({ status: false, message: "Question not found." });
		}

		await questions.destroy({
			where: {
				questionId
			},
		});

		await skillQuestions.destroy({
			where: {
				questionId
			},
		});

		res.status(200).json({ status: true, message: "Question data deleted successfully." });
	} catch (error) {
		console.error("Encountered an error while deleting question: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};

exports.deleteSkillQuestion = async (req, res, next) => {
	try {
		const skillQuestionId = parseInt(req.params.skillQuestionId, 10);

		const skillQuestionExists = await skillQuestions.findOne({
			where: {
				skillQuestionId,
			},
		});

		if(!skillQuestionExists) {
			return res.status(404).json({ status: false, message: "No such skill-question link found."});
		}

		await skillQuestions.destroy({
			where: {
				skillQuestionId
			},
		});

		res.status(200).json({ status: true, message: "Question unlinked with skill level."});
	} catch (error) {
		console.error("Encountered an error while unlinking question with skill level: ", error);
		res.status(500).json({ status: false, message: "Something went wrong!" });
	}
};