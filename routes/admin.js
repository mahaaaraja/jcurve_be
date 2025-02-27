const { Router } = require("express");
const adminController = require("../controllers/adminController");
const validator = require("../util/validator");
const middlewares = require("../util/middlewares")
const uploadAnyFile = require("../util/upload.js");
const router = new Router();

//  TODO add hasAccess

// Recruiter Onboarding
router.get("/getAllRecruiters", adminController.getAllRecruiters);
router.get("/recruiter/:recruiterId", validator.recruiterId(), validator.validate, adminController.getRecruiterById);
router.post("/recruiterOnboarding", uploadAnyFile.fields([{ name: 'organizationLogo', maxCount: 1 }]), adminController.setRecruiterOnboarding);
router.put("/recruiter", uploadAnyFile.fields([{ name: 'organizationLogo', maxCount: 1 }]), adminController.updateRecruiterById);
router.delete("/recruiter/:recruiterId", validator.recruiterId(), validator.validate, adminController.deleteRecruiterById);

// Component Settings
router.post("/createComponentSettings", validator.validateComponentSettingsJsonData(), validator.validate, adminController.createComponentSettings);
router.get("/componentSettings", adminController.getComponentSettings);

// Role And Component Settings
router.get("/roles", adminController.getRoles);
router.get("/roles/:roleId", adminController.getRoleAndComponentSettings);
router.post("/roles", validator.roleName(), validator.validate, adminController.insertRole);
router.put("/roles", validator.validateUpdateRoleData(), validator.validate, adminController.updateRole);
router.delete("/role/:roleId", validator.roleId(), validator.validate, adminController.deleteRole);

// User And Roles
router.get("/users", adminController.getUsers);
router.get("/user/:userId", adminController.getUserDataAndRoles);
router.post("/userRole", validator.userId(), validator.roleId(), validator.validate, adminController.createUserRole);
router.delete("/userRole/:userId/:roleId", validator.userId(), validator.roleId(), validator.validate, adminController.deleteUserRole);

// User And isActive
router.put("/user/activeStatus", validator.userId(), validator.validateIsActive(), validator.validate, adminController.updateUserIsActive);

// ------------------------------------------ OLD ROUTES --------------------------------------------- //

router.post('/login', validator.webLogin(), validator.validate, adminController.adminLogin);

module.exports = router;



