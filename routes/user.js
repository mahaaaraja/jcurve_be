const { Router } = require("express");
const userController = require("../controllers/userController");
const validator = require("../util/validator");
const authController = require("../controllers/authController")
const router = new Router();

router.post("/postenquiry", validator.validateEnquiry(), validator.validate, userController.contactUs);
router.get("/getSplashScreens", userController.getSplashScreens);

router.get("/qualifications", userController.getQualifications);
router.get("/specializations", userController.getSpecializations);
router.get("/companies", userController.getCompaniesList);
router.get("/collegesList", userController.getCollegesList);
router.get("/system/notifications", userController.getSystemNotifications);
router.post("/joinWaitingList", validator.joinWaitingList(), validator.validate, userController.joinWaitingList);
router.get("/waitingListUserCount", userController.waitingListUserCount);

module.exports = router;
