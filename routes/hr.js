const { Router } = require("express");
const hrController = require("../controllers/hrController");
const authController = require("../controllers/authController");
const validator = require("../util/validator");
const { verifyHR, } = require("../util/middlewares");
const uploadAnyFile = require("../util/upload")
const fs = require("fs");
const pdf = require("pdf-parse");
const router = new Router();


router.post("/signup", validator.hrSignup(), validator.validate, hrController.hrSignup);
router.post("/login", validator.webLogin(), validator.validate, hrController.hrLogin);
router.post("/forgotPassword", validator.validateEmail(), validator.validate,
  (req, res, next) => {
    req.body.isRequestFromHrPortal = true;
    next();
  },
  authController.forgotPassword
);
router.post("/logout", verifyHR, hrController.hrLogout);

router.get("/getJobsDropdownList/:userId", validator.userId(), verifyHR, validator.validate, hrController.getJobsDropdownList);
router.get("/recruitmentMetrics", verifyHR, hrController.recruitmentMetrics);
router.get("/allCandidatesList", verifyHR, hrController.allCandidates);
router.get("/allCandidates", verifyHR, hrController.getAllCandidatesWithJobs);
router.get("/getAvailableJobs", verifyHR, hrController.getAvailableJobs);
router.get("/recommendedCandidates/:jobId", verifyHR, hrController.getAllCandidatesWithJobs);
router.get("/getCandidateJobProfile/:jobId/:userId", validator.jobId(), validator.userId(), validator.validate, verifyHR, hrController.getCandidateJobProfile);
router.get("/getskillData/:jobId/:userId", validator.jobId(), validator.userId(), verifyHR, validator.validate, hrController.getskillData);
router.get("/getQualificationsData/:jobId/:userId", validator.jobId(), validator.userId(), verifyHR, validator.validate, hrController.getQualificationsData);
router.get("/offerAnalytics/:userId", validator.userId(), verifyHR, validator.validate, hrController.getOfferAnalytics);
router.get("/performanceMetrics/:jobId/:userId", validator.jobId(), validator.userId(), verifyHR, validator.validate, hrController.getPerformanceMetrics);
router.get("/assessmentsList/:userId", validator.userId(), validator.validate, verifyHR, hrController.getAssessmentsList);
router.get("/getAssessmentResults/:userId/:userAssessmentId", validator.userId(), validator.validate, verifyHR, hrController.getAssessmentResults);
router.get("/getProfileDetails/:userId", validator.userId(), validator.validate, verifyHR, hrController.getProfileDetails);
router.post("/shortListedCandidates", validator.userId(), validator.jobId(), validator.validate, verifyHR, hrController.createShortListCandidates);
router.get("/shortListedCandidates", verifyHR, hrController.getShortListedCandidates);
router.delete("/shortListedCandidates/:jobStatusId", validator.jobStatusId(), validator.validate, verifyHR, hrController.removeShortListCandidates);
router.post("/hiredCandidates", validator.userId(), validator.jobId(), validator.validate, verifyHR, hrController.createHireCandidates);
router.get("/hiredCandidates", verifyHR, hrController.getHiredCandidates);
router.delete("/hiredCandidates/:jobStatusId", validator.jobStatusId(), validator.validate, verifyHR, hrController.removeHireCandidates);
router.get("/candidateAssessmentReport/:userId", validator.userId(), validator.validate, verifyHR, hrController.assessmentReportData);


router.post("/createOpportunity", verifyHR, hrController.postOpportunity);
router.get("/getOpportunities", validator.validateEmploymentType(), validator.validate, verifyHR, hrController.getOpportunities);
router.get("/getJobDetails/:jobId", validator.jobId(), validator.validate, verifyHR, hrController.getJobDetails);
router.put("/jobDetails/:jobId", validator.jobId(), validator.validate, verifyHR, hrController.updateJobDetails);
router.put("/jobFacilities/:jobId", validator.jobId(), validator.validate, verifyHR, hrController.updateJobFacilities);
router.put("/skillLevel/:jobId/:skillId", validator.jobId(), validator.validateSkillId(), validator.validate, verifyHR, hrController.updateRequiredSkillLevel);
router.delete("/deleteJobData/:jobId", validator.jobId(), validator.validate, verifyHR, hrController.deleteJobData);

router.get("/test", hrController.test);

router.get("/updateAvgTrainingTime", hrController.updateAvgTrainingTime);

// comments
router.get("/candidateJobComment/:jobId/:userId", validator.jobId(), validator.userId(), validator.validate, verifyHR, hrController.getAllCandidateJobComments);
router.delete("/candidateJobComment/:commentId", validator.commentId(), validator.validate, verifyHR, hrController.deleteCandidateJobComment);
router.put("/candidateJobComment/:commentId", validator.commentId(), validator.validate, verifyHR, hrController.updateCandidateJobComment);
router.post("/candidateJobComment/:jobId/:userId", validator.jobId(), validator.userId(), validator.validate, verifyHR, hrController.addCandidateJobComment);

// export config
// router.post("/exportConfig", verifyHR, hrController.addHRExportConfig);
router.get("/exportConfig", verifyHR, hrController.getHRExportConfig);
router.put("/exportConfig", validator.validateExportOptions(), validator.validate, verifyHR, hrController.updateHRExportConfig);
router.delete("/exportConfig", verifyHR, hrController.deleteHRExportConfig);


router.get("/jResumeExportConfig/:jobId/:userId", verifyHR, hrController.getHRjresumeExportConfig);
router.put("/jResumeExportConfig", validator.validateExportOptions(), validator.validate, verifyHR, hrController.updateHRjresumeExportConfig);

router.get("/dashboardMetrics", verifyHR, hrController.getHRDashboardMetrics);

// paginated
// /allCandidatesList, /shortListedCandidates, /recommendedCandidates/:jobId

module.exports = router;