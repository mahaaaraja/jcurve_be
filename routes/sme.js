const { Router } = require("express");
const validator = require("../util/validator");

const smeController = require("../controllers/smeController");
const router = new Router();

// update question data
router.put("/questions/:questionId", validator.questionId(), validator.validate, smeController.updateQuestion);
// update question skill level
router.put("/skillQuestion/:skillQuestionId", validator.validateSkillQuestionId(), validator.validate, smeController.updateQuestionSkillLevel);
// get all questions with optional pagination and skillId, skillLevel filters
router.get("/questions", smeController.getAllQuestions);
// get a particular question and all mapped skills and skill levels
router.get("/questions/:questionId", validator.questionId(), validator.validate, smeController.getQuestion);
// add one or more questions
router.post("/questions", smeController.addQuestions); // bulk add
router.post("/skillQuestion/:questionId/:skillId", validator.questionId(), validator.validateSkillId(), validator.validate, smeController.addQuestionSkill);
// delete a particular question with all linked skills
router.delete("/questions/:questionId", validator.questionId(), validator.validate, smeController.deleteQuestion);
// delete skill linked to a particular question
router.delete("/skillQuestion/:skillQuestionId", validator.validateSkillQuestionId(), validator.validate, smeController.deleteSkillQuestion);

module.exports = router;