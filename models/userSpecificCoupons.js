const sequelize = require("sequelize");
const db = require("../util/dbConnection");
const coupons = require('./coupons');

const userSpecificCoupons = db.define("user_specific_coupons", {
  userSpecificCouponId: {
    type: sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: sequelize.INTEGER,
    allowNull: false
  },
  couponId: {
    type: sequelize.INTEGER,
    allowNull: true
  }
});

userSpecificCoupons.belongsTo(users, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});

userSpecificCoupons.belongsTo(coupons, {
    foreignKey: "couponId",
    onDelete: "CASCADE",
});