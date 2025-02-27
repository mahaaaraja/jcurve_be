const { Router } = require("express");
const jobController = require("../controllers/jobController");
const validator = require("../util/validator");

const router = new Router();

router.get("/getjobs", jobController.getJobs);

module.exports = router;
