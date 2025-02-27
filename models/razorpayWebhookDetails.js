const sequelize = require("sequelize");
const db = require("../util/dbConnection");

// storing all the data received from razorpay webhook
const razorpayWebhookDetails = db.define("razorpay_webhook_details", {
  id: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  paymentId: {
    type: sequelize.INTEGER,
    allowNull: true,
  },
  status: {
    type: sequelize.STRING,
    allowNull: true,
  },
  data: {
    type: sequelize.JSON,
    allowNull: true,
  },
});

module.exports = razorpayWebhookDetails;
