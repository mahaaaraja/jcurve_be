const sequelize = require("sequelize")
const db = require("../util/dbConnection")

const assessments = require('./assessments')
const { jobs } = require('./jobs')

const jobAssessments = db.define("job_assessments", {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    jobId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    assessmentId: {
        type: sequelize.INTEGER,
        allowNull: false,
    }
});

jobAssessments.belongsTo(assessments, { foreignKey: "assessmentId", onDelete: "CASCADE" });
jobAssessments.belongsTo(jobs, { foreignKey: "jobId", onDelete: "CASCADE" });

module.exports = jobAssessments;
