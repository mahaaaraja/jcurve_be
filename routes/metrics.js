const { Router } = require("express");
const validator = require("../util/validator");
const { verifyAuthToken } = require("../util/middlewares");
const metricsController = require("../controllers/metrics");
const router = new Router();

router.get("/roadmap/personalizedUsersCount",  metricsController.personalizedUsersCount);
router.get('/roadmap/certificatesCount', verifyAuthToken, metricsController.getCertificateCount);

router.get('/assessments/postRoadmapCompletion', verifyAuthToken, metricsController.postRoadmapCompletion);
router.get('/assessments/averageAssessmentScores', verifyAuthToken, metricsController.averageAssessmentScores);

// user tracking metrics
router.get("/users/newRegistrations", verifyAuthToken, metricsController.getNewUserRegistrations); // Optional - pass start and end date time as query param.
router.get("/users/averageSkillAdded", verifyAuthToken, metricsController.getAverageSkillPerUser);
router.get("/users/studentProfileMetrics", verifyAuthToken, metricsController.getProfileMetrics);

// revenue metrics
router.get("/assessments/revenue", verifyAuthToken, metricsController.getAssessmentRevenue); // Optional - pass start and end date time as query param.

// job metrics ----->  Optional - pass start and end date time as query param
router.get("/jobs/jobListingsViewed", verifyAuthToken, metricsController.getJobListingsViewed); 
router.get("/assessments/preAssessmentStats", verifyAuthToken, metricsController.getPreAssessmentStats);
router.get("/assessments/preAssessmentScores", verifyAuthToken, metricsController.getPreAssessmentScore);
// gives skill wise average score percentage and the average pre assessment score


// platform usage metrics
router.get("/users/activeUsers", verifyAuthToken, metricsController.getActiveUsers); // by default this gives the active users for current day. If start and end date are provided, it gives the active users for that time period.


module.exports = router;

