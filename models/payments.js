const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const coupons = require("./coupons");

const payments = db.define("payments", {
    paymentId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    couponId: {
        type: sequelize.INTEGER,
        allowNull: true
    },
    originalAmount: {
        type: sequelize.DOUBLE,
        allowNull: false,
    },
    discountAmount: {
        type: sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    finalAmount: {
        type: sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    currencyCode: {
        type: sequelize.STRING,
        allowNull: false,
        defaultValue: "INR"
    },
    paidFor: {
        type: sequelize.ENUM('WalletRecharge', 'CartItems'),
        allowNull: true,
    },
    paymentMode: {
        type: sequelize.ENUM('Wallet', 'Razorpay'),
        allowNull: true,
    },
    jcurvePaymentId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    razorpayPaymentId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    razorpayPaymentLinkId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    paymentStatus: {
        type: sequelize.STRING,
        allowNull: true,
    }
});

module.exports = payments;

payments.belongsTo(coupons, { foreignKey: "couponId", onDelete: "CASCADE" });