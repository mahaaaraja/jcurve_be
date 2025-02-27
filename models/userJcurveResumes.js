const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const userJcurveResumes = db.define("user_jcurve_resumes", {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    jobId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    jcurveResume: {
      type: sequelize.STRING,
      allowNull: true,
    }, 
});

module.exports = userJcurveResumes;