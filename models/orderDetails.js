const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const assessments = require("./assessments");
const courses = require("./courses");

const orderDetails = db.define("order_details", {
    orderDetailId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    orderId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    goalId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    jobId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    categoryId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    subCategoryId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    skillId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    itemName: {
        type: sequelize.STRING,
        allowNull: true,
    },
    assessmentSkillIds: {
        type: sequelize.JSON,
        allowNull: true,
    },
    assessmentId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    courseId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    itemType: {
        comment: 'Course/Assessment',
        type: sequelize.ENUM('Course', 'Assessment'),
        allowNull: false,
    },
    amount: {
        type: sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    currencyCode: {
        type: sequelize.STRING,
        allowNull: false,
        defaultValue: "INR"
    }
});

module.exports = orderDetails;

orderDetails.belongsTo(assessments, { foreignKey: "assessmentId", onDelete: "CASCADE" });
orderDetails.belongsTo(courses, { foreignKey: "courseId", onDelete: "CASCADE" });