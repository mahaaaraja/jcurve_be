const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const coupons = db.define("coupons", {
    couponId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    couponCode: {
        type: sequelize.STRING,
        allowNull: false
    },
    couponCount: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    couponsRemaining: {
        type: sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    discountType: {
        comment: 'Flat/Percentage',
        type: sequelize.ENUM('Flat', 'Percentage'),
        allowNull: false
    },
    discountValue: {
        type: sequelize.DOUBLE,
        allowNull: false
    },
    expiryDate: {
        type: sequelize.DATE,
        allowNull: false,
    },
    isAssessmentSpecific: {
        type: sequelize.BOOLEAN,
        defaultValue: false
    },
    assessmentId: {
        type: sequelize.INTEGER,
        allowNull: true
    },
    isActive: {
        type: sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

module.exports = coupons;