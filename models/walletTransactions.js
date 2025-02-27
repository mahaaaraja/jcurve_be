const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const coupons = require("./coupons");

const walletTransactions = db.define("wallet_transactions", {
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
    transactionType: {
        type: sequelize.ENUM("CREDIT", "DEBIT"),
        allowNull: false,
    },
    amount: {
        type: sequelize.STRING,
        allowNull: false,
    },
    referencePaymentId: {
        type: sequelize.STRING,
        allowNull: true,
    },
    paymentInfo: {
        type: sequelize.ENUM("WALLET_RECHARGE", "PAID_FOR_ASSESSMENT", "REFUND", "REWARD"),
        allowNull: true,
    },
    remarks: {
        type: sequelize.STRING,
        allowNull: true,
    },
});

module.exports = walletTransactions;

