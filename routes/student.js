const { Router } = require("express");
const studentController = require("../controllers/studentController");
const validator = require("../util/validator");
const { verifyAuthToken } = require("../util/middlewares");
const uploadAnyFile = require("../util/upload.js");
const { getCookies } = require("../util/cookiesUtil.js");
const router = new Router();

router.get("/student/profilePicture", verifyAuthToken, studentController.getProfilePicture);
router.put("/student/profilePicture", validator.validate, verifyAuthToken, uploadAnyFile.fields([{ name: 'profilePicture', maxCount: 1 }]), studentController.setProfilePicture);
router.delete("/student/profilePicture/:studentId", validator.validateStudentId(), validator.validate, verifyAuthToken, studentController.deleteProfilePicture);

router.put("/student/eligibilityCriteria", verifyAuthToken, uploadAnyFile.fields([{ name: 'tenthMarksheet', maxCount: 1 }, { name: 'twelfthMarksheet', maxCount: 1 }, { name: 'ugMarksheet', maxCount: 1 }]), studentController.updateEligibilityCriteria);

router.get("/student/contactInformation", verifyAuthToken, studentController.getContactInformation);
router.put("/student/contactInformation", validator.validateContactInformation(), validator.validate, verifyAuthToken, studentController.contactInformation);

router.get("/student/workHistory", verifyAuthToken, studentController.getUserWorkHistory);
router.post("/student/workHistory", validator.validateWorkHistory(), validator.validate, verifyAuthToken, studentController.workHistory);
router.put("/student/workHistory", validator.validateUpdateWorkHistory(), validator.validate, verifyAuthToken, studentController.updateUserWorkHistory);
router.delete("/student/deleteWorkHistory/:experienceId", validator.validateExperienceId(), validator.validate, verifyAuthToken, studentController.deleteWorkHistory);

router.get("/student/education", verifyAuthToken, studentController.getUserEducation);
router.post("/student/education", validator.validateEducation(), validator.validate, verifyAuthToken, studentController.education);
router.put("/student/education", validator.validateUpdateEducation(), validator.validate, verifyAuthToken, studentController.updateUserEducation);
router.delete("/student/deleteEducation/:educationId", validator.validateEducationId(), validator.validate, verifyAuthToken, studentController.deleteEducation);

router.get("/student/getSkillList", validator.validate, verifyAuthToken, studentController.getSkillList)
router.get("/student/selectedUserSkillList", validator.validate, verifyAuthToken, studentController.selectedUserSkillList);
router.post("/student/userSkillList", validator.validateUserSkillsList(), validator.validate, verifyAuthToken, studentController.updateUserSkillList);
router.put("/student/userSkillLevel", validator.validateSkillId(), validator.validateresumeSkillLevel(), validator.validate, verifyAuthToken, studentController.updateUserSkillLevel);
router.put("/student/userSkillLevels", validator.validateSkillsToUpdate(), validator.validate, verifyAuthToken, studentController.updateUserSkillLevels);
router.delete("/student/deleteUserSkill/:skillId", validator.validateSkillId(), validator.validate, verifyAuthToken, studentController.deleteUserSkill);

router.get("/student/resume", verifyAuthToken, studentController.getResumeFile);
router.put("/student/resume", validator.validate, verifyAuthToken, uploadAnyFile.fields([{ name: 'resumeFile', maxCount: 1 }]), studentController.setResumeFile);
router.delete("/student/resume/:studentId", validator.validateStudentId(), validator.validate, verifyAuthToken, studentController.deleteResumeFile);

router.get("/student/profileCompletionPercentage", verifyAuthToken, studentController.profileCompletionPercentage);
router.get("/student/jcurveSkillsEarned", verifyAuthToken, studentController.jcurveSkillsEarned);
router.get("/student/userRoadmapsProgress", verifyAuthToken, studentController.userRoadmapsProgress);

router.post("/student/studentPreference", validator.validateStudentPreference(), validator.validate, verifyAuthToken, studentController.createStudentPreference);
router.get("/student/studentPreference", verifyAuthToken, studentController.getStudentPreferenceByUserId);
router.put("/student/studentPreference", validator.validateStudentPreference(), validator.validate, verifyAuthToken, studentController.updateStudentPreference);
router.delete("/student/studentPreference", verifyAuthToken, studentController.deleteStudentPreference);

// router.get("/student/videoMaterial/:materialId", validator.validateMaterialId(), validator.validate, verifyAuthToken, validator.validate,  studentController.getVideoMaterial)

//* dashboard

router.get("/student/jcurveResumeContactInfo", verifyAuthToken, studentController.getjcurveResumeContactInformation);
router.put("/student/jcurveResumeContactInfo", verifyAuthToken, uploadAnyFile.fields([{ name: 'profilePicture', maxCount: 1 }]), studentController.updatejcurveResumeContactInformation);

router.get("/student/getAvailableJobsCount", verifyAuthToken, studentController.getAvailableJobsCount);
router.get("/student/pursuingRoadmapsCount", verifyAuthToken, studentController.pursuingRoadmapsCount);
router.get("/student/assessmentTestReports", verifyAuthToken, studentController.assessmentTestReports);
router.get("/student/jcurveResume", verifyAuthToken, studentController.assessmentReportData);
router.put("/student/jcurveResume", verifyAuthToken, uploadAnyFile.fields([{ name: 'profilePicture', maxCount: 1 }]), studentController.updateJcurveResume);
router.post("/student/jcurveResume", verifyAuthToken, uploadAnyFile.fields([{ name: 'jcurveResume', maxCount: 1 }]), studentController.setJcurveResumeFile);
router.get("/student/userAssessments", verifyAuthToken, studentController.getUserAssessmentsDetails);
router.get("/student/getAssessmentResults/:userAssessmentId", verifyAuthToken, studentController.getAssessmentResults);
router.get('/dashboard/certificates', verifyAuthToken, studentController.getCertificateCount);
router.get('/student/certificates', verifyAuthToken, (req, res, next) => {
	if (req.query && req.query.courseId) {
		validator.validateCourseId();
		next();
	} else {
		next();
	}
}, studentController.getStudentCertificates);

//* jobs
router.get("/student/getJobs", studentController.getJobs);
router.get("/student/getJobDetails/:jobId", (req, res, next) => {
	const cookies = getCookies(req);
	if(cookies.jc_rt) {
		verifyAuthToken(req, res, next);
	} else {
		next();
	}
}, studentController.getJobDetails);
router.post("/student/addToDreamJobList", validator.jobId(), validator.validate, verifyAuthToken, studentController.addToDreamJobList);
router.get("/student/getJobAssessments", validator.validateRoadmapType(), validator.validate, verifyAuthToken, studentController.getJobAssessments);
router.get("/student/getAssessmentLink/:jobId/:assessmentId", verifyAuthToken, studentController.getAssessmentLink);
router.post("/webhook/testlify", studentController.webhookTestlify); //* webhook

//* roadmap
router.get("/student/getRoadmaps", studentController.getRoadmaps);
router.get('/student/getRoadmaps/:goalId', validator.validateGoalId(), validator.validate, verifyAuthToken, studentController.getRoadmapCategories);
router.get("/student/getRoadmaps/:goalId/:categoryId", verifyAuthToken, studentController.getRoadmapSubCategories);
router.get("/student/getRoadmaps/:goalId/:categoryId/:subCategoryId", verifyAuthToken, studentController.getRoadmapSkills);
router.get("/student/getRoadmaps/:goalId/:categoryId/:subCategoryId/:skillId", verifyAuthToken, studentController.getRoadmapCourses);

//* youtube course tracking
router.get("/student/getCourseProgress/:courseId", validator.validateCourseId(), validator.validate, verifyAuthToken, studentController.getCourseProgress);
router.put("/student/setCourseProgress", validator.updateCourseProgress(), validator.validate, verifyAuthToken, studentController.setCourseProgress);
router.put("/student/setCourseWatchTime", validator.updateCourseWatchTime(), validator.validate, verifyAuthToken, studentController.setCourseWatchTime);
router.post("/student/uploadCourseCertificates", verifyAuthToken, uploadAnyFile.fields([{ name: 'certificateFile', maxCount: 1 }]), validator.validateCourseId(), validator.courseCertificates(), validator.validate, studentController.uploadCourseCertificates);

//* udemy course tracking
router.post("/student/courseTracking/udemy", studentController.udemyCourseTracking);

//* explore page
router.get("/student/trendingJobRolesAndSalaries", studentController.trendingJobRolesAndSalaries);
router.get("/student/topHighPayingCompanies", studentController.topHighPayingCompanies);
router.get("/student/trendingJobRoles", studentController.trendingJobRoles);

//* quiz
router.get("/getQuestionsByCourseAndLevel/:courseId/:level", validator.validateCourseId(), validator.validateLevel(), validator.validate, verifyAuthToken, studentController.getQuestionsByCourseAndLevel)
router.get("/getQuestionsByGoalIdAndCurriculumId/:goalId/:curriculumId", validator.validateGoalId(), validator.validateCurriculumId(), validator.validate, verifyAuthToken, studentController.getQuestionsByGoalIdAndCurriculumId)
router.put("/updatequiztime", validator.updateQuizRemainingTime(), validator.validate, verifyAuthToken, studentController.updateQuizRemainingTime)
router.put("/updatequizstatus", validator.updateQuizStatus(), validator.validate, verifyAuthToken, studentController.updateQuizStatus);

router.get("/getmatchscore", verifyAuthToken, studentController.studentJobMatchScore);
router.get("/student/testlifyAssessmentData", verifyAuthToken, studentController.testlifyAssessmentData);

router.get("/studentFetchData/:party", verifyAuthToken, studentController.thirdPartyFetchData);
router.get("/fetchdata/:party/callback", studentController.thirdPartyFetchDataCallback);

router.get("/student/fetchSimplilearnCourseLink/:goalId/:curriculumId/:courseId/:materialId", verifyAuthToken, studentController.fetchSimplilearnCourseLink);
router.get("/student/fetchSimplilearnCourseProgress/:materialId", verifyAuthToken, studentController.fetchSimplilearnCourseProgress);
router.post("/xapi/simplilearn/statements", studentController.xapiSimplilearn); //* webhook
router.post("/student/analyzeResumeFile", verifyAuthToken, uploadAnyFile.fields([{ name: 'resumeFile', maxCount: 1 }]), studentController.analyzeResumeFile);

router.get("/bulkResumeAnalysis", studentController.readDataFromResumes);

// assessment proctoring
router.post("/assessment/proctoring/violations/:userAssessmentId", validator.validateUserAssessmentId(), validator.validate, verifyAuthToken, studentController.logViolationEvent);
router.post("/assessment/proctoring/snapshots/:userAssessmentId", validator.validateUserAssessmentId(), validator.validate, verifyAuthToken, studentController.addSnapshotLink)

router.get("/assessment/myAssessments", verifyAuthToken, studentController.getMyAssessments);
router.get("/assessment/myAssessments/:userAssessmentId", validator.validateUserAssessmentId(), validator.validate, verifyAuthToken, studentController.getAssessmentById);
router.get("/assessment/questions/:userAssessmentId", validator.validateUserAssessmentId(), validator.validate, verifyAuthToken, studentController.getAssessmentQuestions);
router.put("/assessment/updateAnswers/:userAssessmentId", validator.validateUserAssessmentId(), validator.validateRemainingTime(), validator.validateUserAnswers(), validator.validate, verifyAuthToken, studentController.updateAssessmentAnswers);
router.put("/assessment/remainingTime/:userAssessmentId", validator.updateAssessmentRemainingTime(), validator.validate, verifyAuthToken, studentController.updateAssessmentRemainingTime);

module.exports = router;
