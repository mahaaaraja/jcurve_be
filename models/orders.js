const sequelize = require("sequelize");
const db = require("../util/dbConnection");

const orders = db.define("orders", {
    orderId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    uniqueOrderId: {
        type: sequelize.STRING,
        allowNull: false,
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    orderAmount: {
        type: sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    currencyCode: {
        type: sequelize.STRING,
        allowNull: false,
        defaultValue: "INR"
    },
    paymentId: {
        type: sequelize.INTEGER,
        allowNull: true,
    },
    paymentStatus: {
        type: sequelize.STRING,
        allowNull: true,
    }
});

module.exports = orders;