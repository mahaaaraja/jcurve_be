const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const user = require("./users");
const coupons = require("./coupons");

const couponRedemptions = db.define("coupon_redemptions", {
    couponRedemptionId: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    orderId: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    couponId: {
        type: sequelize.INTEGER,
        allowNull: false
    },
});

couponRedemptions.belongsTo(user, { foreignKey: "userId", onDelete: "CASCADE" });
couponRedemptions.belongsTo(coupons, { foreignKey: "couponId", onDelete: "CASCADE" });

module.exports = couponRedemptions;