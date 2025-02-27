const { Router } = require("express");
const paymentController = require("../controllers/paymentController");
const validator = require("../util/validator");
const { verifyAuthToken } = require("../util/middlewares");
const router = new Router();

router.post("/addToCart", verifyAuthToken, paymentController.addToCart);
router.post("/addAssessmentToCart", validator.addAssessmentToCart(), validator.validate, verifyAuthToken, paymentController.addAssessmentToCart);
router.delete("/removeFromCart", verifyAuthToken, validator.validateRemoveFromCart(), validator.validate, paymentController.removeFromCart);
router.get("/getCartItems", verifyAuthToken, paymentController.getCartItems);
router.post("/buyAssessment", validator.validateOrderId(), validator.validate, verifyAuthToken, paymentController.orderByWallet);
router.get("/myOrders", verifyAuthToken, paymentController.myOrders);
router.post("/rechargeWallet", validator.rechargeWallet(), validator.validate, verifyAuthToken, paymentController.rechargeWallet);
router.post("/paymentLink", verifyAuthToken, paymentController.paymentLink);
router.get("/getOrderDetails", verifyAuthToken, paymentController.getOrderDetails);
router.post("/applyCouponCode", verifyAuthToken, paymentController.applyCouponCode);
router.post("/webhook/razorpay", paymentController.razorpayWebhook);

module.exports = router;
