const { Router } = require("express");
const validator = require("../util/validator");
const { verifyAuthToken } = require("../util/middlewares");
const authController = require("../controllers/authController");
const { getCookies } = require("../util/cookiesUtil");
const router = new Router();

router.post("/validateEmail", validator.validateEmail(), validator.validate, authController.validateEmail);
router.put("/verifyEmail/:token", validator.token(), validator.validate, authController.verifyEmail);
router.post('/signup', validator.userSignup(), validator.validate, authController.signupWithEmail);
router.post('/webLogin', validator.webLogin(), validator.validate, authController.webLogin);

router.post("/forgotPassword", validator.validateEmail(), validator.validate, authController.forgotPassword);
router.put("/verifyForgotPasswordToken/:token", validator.token(), validator.validate, authController.verifyForgotPasswordToken);
router.put("/updatePassword/:userId/:token", validator.updatePasswordRules(), validator.validate, authController.updatePassword);
router.post("/changePassword", validator.changePasswordRules(), validator.validate, verifyAuthToken, authController.changePassword);

router.get("/componentSettings", (req, res, next) => {
  if ((req.query.roleName && req.query.roleName == "student") && (req.query.pageName == "home" || req.query.pageName == "jobs" || req.query.pageName == "job-details" || req.query.pageName == "explore")) {
    next();
  } else {
    verifyAuthToken(req, res, next);
  }
}, authController.getComponentSettings);

router.get("/refreshTokens", authController.refreshToken);
router.get("/loginWithCookies", authController.cookieLogin);
router.post("/logout", authController.logout);

router.get("/auth/:party", authController.thirdPartyAuth);
router.get("/auth/:party/callback", authController.thirdPartyAuthCallback);

module.exports = router;
