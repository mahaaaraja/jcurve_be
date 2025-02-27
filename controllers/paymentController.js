const crypto = require('crypto');
const { Op, Sequelize } = require('sequelize');
const axios = require('axios');

const users = require('../models/users.js');
const payments = require('../models/payments.js');
const razorpayWebhookDetails = require('../models/razorpayWebhookDetails.js');
const students = require('../models/students.js');
const coupons = require('../models/coupons.js');
const couponRedemptions = require('../models/couponRedemptions.js');
const assessments = require('../models/assessments.js');
const jobAssessments = require('../models/jobAssessments.js');
const orders = require('../models/orders.js');
const orderDetails = require('../models/orderDetails.js');
const userAssessments = require('../models/userAssessments.js');
const assessmentInvitationDetails = require('../models/assessmentInvitationDetails.js');
const courses = require('../models/courses.js');
const assessmentPricingConfig = require('../models/assessmentPricingConfig.js');
const skills = require('../models/skills.js');
const subCategories = require('../models/subCategories.js');
const categories = require('../models/categories.js');
const { jobs } = require('../models/jobs.js');
const goals = require('../models/goals.js');

const { createPaymentLink } = require('../util/razorpay');
const sendMailer = require('../util/nodeMailer');
const sequelize = require('../util/dbConnection');
const walletTransactions = require('../models/walletTransactions.js');
const userAssessmentOrders = require('../models/userAssessmentOrders.js');
const assessmentSkillConfig = require('../models/assessmentSkillConfig.js');
const userAssessmentQuestions = require('../models/userAssessmentsQuestions.js');
const userSkillLevels = require('../models/userSkillLevels.js');
const assessmentConfigs = require('../models/assessmentConfigs.js');
const jobGoals = require('../models/jobGoals.js');


const generateUniqueOrderId = () => {
	return "ORD" + Math.floor(100000 + Math.random() * 900000).toString();
};

const sendCourseMail = async (paymentStatus, email, studentFirstName, courseName) => {
	let subject = "", mailBody = "";
	if (paymentStatus === 'Paid') {
		subject = 'Course Enrollment Confirmed: Start Learning Today!';
		mailBody = `
		<html>
		<head></head>
		<body>
			<div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
				<img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
				<div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
					<p>Hi ${studentFirstName},</p>
					
					<p>
						Congratulations! Your payment for ${courseName} has been successfully processed. Start your learning journey now and unlock new opportunities with JCurve.
					</p>

					<p>Best Regards,</p>
					<p>Customer Success Team,</p>
					<p>JCurve</p>
				</div>
				<p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
			</div>
		</body>
		</html>`;
	} else {
		subject = `Action Required: Payment Failed for ${courseName}`;
		mailBody = `
		<html>
		<head></head>
		<body>
			<div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
				<img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
				<div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
					<p>Hi ${studentFirstName},</p>
					
					<p>
						We regret to inform you that your payment for ${courseName} was unsuccessful. Please update your payment details to continue with your enrollment.
					</p>

					<p>Best Regards,</p>
					<p>Customer Success Team,</p>
					<p>JCurve</p>
				</div>
				<p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
			</div>
		</body>
		</html>`;
	}

	if (!(subject && mailBody && email)) {
		console.error("Something went wrong!");
	}

	try {
		await sendMailer.sendMail(email, subject, mailBody);
	} catch (err) {
		console.error('Error sending course payment mail: ', err);
	}
};

const sendAssessmentMail = async (paymentStatus, email, studentFirstName, assessmentName) => {
	let subject = "", mailBody = "";
	if (paymentStatus === 'Paid') {
		subject = 'Assessment Enrollment Confirmed: Prepare to Excel!';
		mailBody = `
		<html>
		<head></head>
		<body>
			<div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
				<img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
				<div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
					<p>Hi ${studentFirstName},</p>

					<p>
						Congratulations! Your payment for the assessment ${assessmentName} has been successful. Get ready to showcase your skills and excel in your career.
					</p>

					<p>Best Regards,</p>
					<p>Customer Success Team,</p>
					<p>JCurve</p>
				</div>
				<p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
			</div>
		</body>
		</html>`;
	} else {
		subject = 'Action Required: Payment Failed for Assessment';
		mailBody = `
		<html>
		<head></head>
		<body>
			<div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
				<img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
				<div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
					<p>Hi ${studentFirstName},</p>

					<p>
						We regret to inform you that your payment for the assessment ${assessmentName} was unsuccessful. Please update your payment details to proceed with your assessment.
					</p>

					<p>Best Regards,</p>
					<p>Customer Success Team,</p>
					<p>JCurve</p>
				</div>
				<p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
			</div>
		</body>
		</html>`;
	}

	if (!(subject && mailBody && email)) {
		console.error('Something went wrong!');
	}

	try {
		await sendMailer.sendMail(email, subject, mailBody);
	} catch (err) {
		console.error('Error sending course payment mail: ', err);
	}
};

const createRazorpayLink = async (userInfo, paymentFor, razorpayAmount, description) => {
	let { uniqueId, email, countryCode, phoneNumber } = userInfo;
	let userPhoneNumber = (countryCode + phoneNumber) || null;
	let data = await createPaymentLink(razorpayAmount, description, uniqueId, email, userPhoneNumber, paymentFor);
	return data;
};

exports.applyCouponCode = async (req, res, next) => {
	try {
		let userId = req.userId;
		const { couponCode, orderAmount } = req.body;

		const couponInfo = await coupons.findOne({
			where: {
				couponCode, isActive: 1,
				couponCount: { [Op.gt]: 0 },
				couponsRemaining: { [Op.gt]: 0 },
				expiryDate: { [Op.gt]: new Date() }
			}
		});

		if (!couponInfo) {
			return res.status(404).json({ success: false, message: "Invalid coupon." });
		}

		const pendingOrder = await orders.findOne({ where: { userId, paymentStatus: "Pending" } });
		if (!pendingOrder) {
			return res.status(404).json({ success: false, message: "Add items to cart. Can not apply coupon on empty cart." });
		}

		let pendingOrderAmount = pendingOrder.orderAmount;

		if (pendingOrderAmount != orderAmount) {
			return res.status(422).json({ success: false, message: "Order amount mismatch." });
		}

		// checking if coupon is applicable to jobAssessmentId
		if (couponInfo.isAssessmentSpecific) {
			let query = `
				SELECT
					od.*
				FROM order_details od
				JOIN assessments a ON od.assessmentId = a.assessmentId
				LEFT JOIN job_assessments ja ON ja.assessmentId = a.assessmentId
				WHERE od.orderId = ${pendingOrder.orderId} AND ja.assessmentId = ${couponInfo.assessmentId};
			`;
			const isCouponApplicableToJobAssessment = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
			if (!isCouponApplicableToJobAssessment.length) {
				return res.status(422).json({ success: false, message: "Coupon not applicable." });
			}
		}
		// END

		let { couponId, discountType, discountValue } = couponInfo;

		const couponUsed = await couponRedemptions.findOne({ where: { userId, couponId } });

		if (couponUsed) {
			return res.status(422).json({ success: false, message: "Coupon already redeemed." });
		}

		if (discountType == "Percentage") {
			discountAmount = parseFloat(((orderAmount * discountValue) / 100).toFixed(2));
		} else {
			discountAmount = discountValue;
		}

		const data = { couponId, couponCode, orderAmount, discountAmount };

		res.status(200).json({ status: true, data });
	} catch (error) {
		console.error("Encountered an error while applying coupon code: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
};

exports.getCartItems = async (req, res, next) => {
	try {
		let userId = req.userId;
		let orderData = await orders.findOne({ where: { userId, paymentStatus: "Pending" } });

		if (!orderData) {
			return res.status(200).json({ status: true, data: [], message: "No items found in your cart." });
		}

		let assessmentImageLink = process.env.API_HOST_URL + "assessment-logo.png";

		let itemsQuery = `
			SELECT
				IF(od.courseId, c.courseId, od.orderDetailId) AS itemId,
				IF(od.courseId, c.courseName, od.itemName) AS itemName,
				IF(od.courseId, c.thumbnail, "${assessmentImageLink}") AS itemThumbnail,
				od.itemType, od.amount,
				od.jobId, od.categoryId, od.subCategoryId, od.skillId, od.goalId
			FROM order_details od
			JOIN orders o ON o.orderId = od.orderId
			LEFT JOIN courses c ON c.courseId = od.courseId
			LEFT JOIN assessments a ON od.assessmentId = a.assessmentId
			WHERE od.userId = ${userId} and o.orderId = ${orderData.orderId}`;

		const cartItems = await sequelize.query(itemsQuery, { type: sequelize.QueryTypes.SELECT });

		let data = {
			orderId: orderData.orderId,
			orderAmount: orderData.orderAmount,
			paymentStatus: orderData.paymentStatus,
			orderTimestamp: orderData.updatedAt,
			cartItems
		}

		res.status(200).json({ status: true, data });
	} catch (error) {
		console.error("Encountered an error while fetching cart items: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
};

exports.orderByWallet = async (req, res, next) => {
	try {
		const userId = req.userId;
		const { orderId, couponId = null } = req.body;

		const orderData = await orders.findOne({ where: { orderId, userId } });
		if (!orderData) {
			return res.status(404).json({ status: false, message: "Order not found." });
		}
		if (orderData.paymentStatus != "Pending") {
			return res.status(422).json({ status: false, message: "Payment already done." });
		}

		const userInfo = await users.findOne({ where: { userId } });
		if (!userInfo) {
			return res.status(404).json({ status: false, message: "User not found." });
		}

		const orderDetailsData = await orderDetails.findAll({ where: { orderId } });
		if (!orderDetailsData.length) {
			return res.status(404).json({ status: false, message: "Order details not found." });
		}

		let discountAmount = 0;
		let originalAmount = orderData.orderAmount;

		if (couponId) {
			const couponInfo = await coupons.findOne({
				where: {
					couponId, isActive: 1,
					couponCount: { [Op.gt]: 0 },
					couponsRemaining: { [Op.gt]: 0 },
					expiryDate: { [Op.gt]: new Date() }
				}
			});

			if (!couponInfo) {
				return res.status(422).json({ status: false, message: "Invalid coupon." });
			}

			if (!couponInfo.isAssessmentSpecific) {
				return res.status(422).json({ status: false, message: "Coupon is not applicable to this order." });
			}

			// checking if coupon is applicable to jobAssessmentId
			// if (couponInfo.isAssessmentSpecific) {
			// 	let query = `
			// 		SELECT
			// 			od.*
			// 		FROM order_details od
			// 		JOIN assessments a ON od.assessmentId = a.assessmentId
			// 		WHERE od.orderId = ${orderId} AND a.assessmentId = ${couponInfo.assessmentId};
			// 	`;
			// 	const isCouponApplicableToProvidedJobAssessmentId = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
			// 	if (!isCouponApplicableToProvidedJobAssessmentId.length) {
			// 		return res.status(422).json({ status: false, message: "Coupon not applicable." });
			// 	}
			// }

			// END

			const couponUsed = await couponRedemptions.findOne({ where: { userId, couponId } });

			if (couponUsed) {
				return res.status(422).json({ status: false, message: "Coupon already redeemed." });
			}

			let { discountType, discountValue } = couponInfo;
			if (discountType === 'Percentage') {
				discountAmount = parseFloat(((originalAmount * discountValue) / 100).toFixed(2));
			} else {
				discountAmount = discountValue;
			}
		}

		let finalAmount = originalAmount - discountAmount;
		if (finalAmount < 0) {
			finalAmount = 0;
		}

		let userCredits = userInfo.jcurveCredits ? atob(userInfo.jcurveCredits) : 0;

		if (userCredits < finalAmount) {
			return res.status(422).json({ status: false, message: "Insufficient credits." });
		}

		for (let i = 0; i < orderDetailsData.length; i++) {
			const orderDetail = orderDetailsData[i];
			const { orderDetailId, goalId = null, jobId = null, categoryId = null, subCategoryId = null, skillId = null, itemName, itemType, amount, assessmentSkillIds } = orderDetail;

			if (itemType == "Assessment") {
				async function createUserAssessment(orderDetailId, goalId, jobId, categoryId, subCategoryId, skillId, assessmentSkillIds, itemName, amount) {
					let whereCondition = {};
					if (skillId) {
						whereCondition = { skillId, categoryId: null, subCategoryId: null, jobId: null, goalId: null };
					} else {
						whereCondition = { goalId, skillId: { [Sequelize.Op.in]: assessmentSkillIds }, jobId: jobId || null };
					}

					let goalSkillLevel = 9;

					let query = `
						SELECT main.*
						FROM (
							SELECT sq.*, q.marks, ac.id AS acId, ac.skillId AS acSkillId, ac.jobId, ac.goalId, 
							ac.totalQuestions, ac.begineerQuestions, ac.intermediateQuestions, 
								ac.advanceQuestions, ac.totalTime, ac.credits,
								ROW_NUMBER() OVER (PARTITION BY sq.skillId, sq.skillLevel ORDER BY RAND()) AS rn
							FROM skill_questions sq
							JOIN questions q ON sq.questionId = q.questionId AND q.isApproved = 1
							JOIN assessment_configs ac ON ac.skillId = sq.skillId
							WHERE 
								(
									(:skillId IS NOT NULL AND ac.skillId = :skillId AND ac.categoryId IS NULL AND ac.subCategoryId IS NULL AND ac.jobId IS NULL AND ac.goalId IS NULL)
									OR
									(:skillId IS NULL AND ac.goalId = :goalId AND ac.skillId IN (:assessmentSkillIds) ${jobId ? ' AND ac.jobId = :jobId ' : 'AND ac.jobId IS NULL'})
								)

						) AS main
						WHERE 
							(main.skillLevel = 5 AND main.rn <= COALESCE(main.begineerQuestions, 0)) OR
							(main.skillLevel = 7 AND main.rn <= COALESCE(main.intermediateQuestions, 0)) OR
							(main.skillLevel = 9 AND main.rn <= COALESCE(main.advanceQuestions, 0));
					`
					// --	${jobId ? 'JOIN job_skills js ON js.skillId = sq.skillId AND js.requiredSkillLevel = sq.skillLevel AND js.jobId = :jobId' : ''}
					// --	${!jobId && !skillId ? ' AND sq.skillLevel = :goalSkillLevel' : ''}

					const questionSkillsData = await sequelize.query(query, {
						type: sequelize.QueryTypes.SELECT,
						replacements: { skillId, jobId, goalId, assessmentSkillIds, goalSkillLevel }
					});
					
					const uniqueAcIds = questionSkillsData.reduce((acc, curr) => {
						if (!acc[curr.acId]) {
						  acc[curr.acId] = curr.totalTime;
						}
						return acc;
					}, {});
					
					const totalAssessmentTime = Object.values(uniqueAcIds).reduce((sum, time) => sum + time, 0);
					const totalMarks = questionSkillsData.reduce((sum, item) => sum + (item.marks || 0), 0);
					const userAssessment = await userAssessments.create({
						orderDetailId, userId, jobId, amount, assessmentSkillIds,
						assessmentName: itemName,
						assessmentProvider: "JCurve",
						assessmentStatus: "ENROLLED", // TODO: change to INVITED
						totalQuestion: questionSkillsData.length,
						totalScore: totalMarks,
						totalTestTimeInSec: totalAssessmentTime * 60,
					})
		
					let userAssessmentQuestionsCreateData = [];
					for (let j = 0; j < questionSkillsData.length; j++) {
						const questionSkill = questionSkillsData[j];
						const { questionId, skillId } = questionSkill;
						userAssessmentQuestionsCreateData.push({
							userId, goalId, jobId, categoryId, subCategoryId, skillId, questionId,
							userAssessmentId: userAssessment.userAssessmentId,
						})
					}
		
					if (userAssessmentQuestionsCreateData.length) {
						await userAssessmentQuestions.bulkCreate(userAssessmentQuestionsCreateData)
					}
				}

				if (!categoryId && !subCategoryId && !skillId) {
					if (jobId) {
						const categorySkillsQuery = `
							SELECT grm.categoryId, JSON_ARRAYAGG(js.skillId) as skillIds, j.jobTitle, c.categoryName
							FROM goal_road_maps grm
							JOIN job_skills js ON js.skillId = grm.skillId
							JOIN categories c ON c.categoryId = grm.categoryId AND grm.goalId = :goalId
							JOIN jobs j ON j.jobId = js.jobId
							WHERE js.jobId = :jobId AND grm.goalId = :goalId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true) AND grm.skillId IN (:assessmentSkillIds)
							GROUP BY grm.categoryId
							ORDER BY grm.categoryId;
						`;

						const replacements = {jobId, goalId, assessmentSkillIds};
						const categorySkillsData = await sequelize.query(categorySkillsQuery, {
							type: sequelize.QueryTypes.SELECT,
							replacements
						});

						for (let j = 0; j < categorySkillsData.length; j++) {
							const categorySkills = categorySkillsData[j];
							let { jobTitle, categoryName, categoryId, skillIds } = categorySkills;
							let categoryIdSkillIds = [...new Set(skillIds)];
							let assessmentName = createAssessmentName(null, jobTitle, categoryName)

							const assessmentPricingData = await assessmentConfigs.findOne({
								where: { goalId, jobId, skillId: { [Sequelize.Op.in]: categoryIdSkillIds } },
								attributes: [[sequelize.fn('SUM', sequelize.col('credits')), 'totalCredits']],
								raw: true
							});
							const totalCredits = assessmentPricingData.totalCredits || 0;

							await createUserAssessment(orderDetailId, goalId, jobId, categoryId, subCategoryId, skillId, categoryIdSkillIds, assessmentName, totalCredits);
						}
					} else {
						const categorySkillsQuery = `
							SELECT grm.categoryId, JSON_ARRAYAGG(grm.skillId) as skillIds, g.goalName, c.categoryName
							FROM goal_road_maps grm
							JOIN categories c ON c.categoryId = grm.categoryId
							JOIN goals g ON grm.goalId = g.goalId
							WHERE grm.goalId = :goalId AND grm.skillId IN (:assessmentSkillIds) 
							GROUP BY grm.categoryId
							ORDER BY grm.categoryId;
						`;
						
						const replacements = {goalId, assessmentSkillIds};
						const categorySkillsData = await sequelize.query(categorySkillsQuery, {
							type: sequelize.QueryTypes.SELECT,
							replacements
						});

						for (let j = 0; j < categorySkillsData.length; j++) {
							const categorySkills = categorySkillsData[j];
							let { goalName, categoryName, categoryId, skillIds } = categorySkills;
							let categoryIdSkillIds = [...new Set(skillIds)];
							let assessmentName = createAssessmentName(goalName, null, categoryName)
							
							const assessmentPricingData = await assessmentConfigs.findOne({
								where: { goalId, jobId: null, skillId: { [Sequelize.Op.in]: categoryIdSkillIds } },
								attributes: [[sequelize.fn('SUM', sequelize.col('credits')), 'totalCredits']],
								raw: true
							});
							const totalCredits = assessmentPricingData.totalCredits || 0;

							await createUserAssessment(orderDetailId, goalId, jobId, categoryId, subCategoryId, skillId, categoryIdSkillIds, assessmentName, totalCredits);
						}
					}
				} else {
					await createUserAssessment(orderDetailId, goalId, jobId, categoryId, subCategoryId, skillId, assessmentSkillIds, itemName, amount);
				}
			}
		}

		const createPayment = await payments.create({ 
			userId, couponId, originalAmount, discountAmount, finalAmount,
			paidFor: "CartItems",
			paymentMode: "Wallet",
			jcurvePaymentId: `jpay-${crypto.randomUUID()}`,
			razorpayPaymentId: null,
			razorpayPaymentLinkId: null,
			paymentLink: null,
			paymentStatus: "Paid",
		});
		await walletTransactions.create({ userId, transactionType: "DEBIT", amount: finalAmount, referencePaymentId: createPayment.jcurvePaymentId, paymentInfo: "PAID_FOR_ASSESSMENT" });
		await orders.update({ paymentId: createPayment.paymentId, paymentStatus: "Completed" }, { where: { orderId: orderId } });		

		await users.update({ jcurveCredits: btoa(Number(userCredits) - finalAmount) }, { where: { userId } });
		
		if (couponId) {
			await couponRedemptions.create({ userId, orderId, couponId });
			const couponInfo = await coupons.findOne({ where: { couponId } });
			let { couponsRemaining } = couponInfo;
			couponsRemaining--;
			await coupons.update({ couponsRemaining }, { where: { couponId } });
		}

		res.status(200).json({ status: true, data: { jcurvePaymentId: createPayment.jcurvePaymentId }, message: "Payment Successful." });
	} catch (error) {
		console.error("Encountered an error while checking out: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}	
}

exports.myOrders = async (req, res, next) => {
	try {
		let userId = req.userId;
		let assessmentImageLink = process.env.API_HOST_URL + "assessment-logo.png";

		let query = `
			SELECT
				IF(od.courseId, c.courseId, od.orderDetailId) AS itemId,
				IF(od.courseId, c.courseName, od.itemName) AS itemName,
				IF(od.courseId, c.thumbnail, "${assessmentImageLink}") AS itemThumbnail,
				od.itemType, od.amount, o.uniqueOrderId as orderId, p.razorpayPaymentId AS razorpayPaymentId, p.jcurvePaymentId,
				p.finalAmount as orderAmount, p.originalAmount, p.discountAmount, o.updatedAt as orderTimestamp, o.paymentStatus
			FROM order_details od
			JOIN orders o ON o.orderId = od.orderId
			JOIN payments p ON o.paymentId = p.paymentId
			LEFT JOIN courses c ON c.courseId = od.courseId
			WHERE od.userId = ${userId} AND o.paymentStatus = "Completed";
		`;

		let data = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

		data = Object.values(data.reduce((acc, item) => {
			if (!acc[item.orderId]) {
				acc[item.orderId] = {
					orderId: item.orderId,
					razorpayPaymentId: item.razorpayPaymentId,
					jcurvePaymentId: item.jcurvePaymentId,
					orderAmount: item.orderAmount,
					discountAmount: item.discountAmount,
					originalAmount: item.originalAmount,
					orderTimestamp: item.orderTimestamp,
					paymentStatus: item.paymentStatus,
					cartItems: []
				};
			}
			acc[item.orderId].cartItems.push({
				itemId: item.itemId,
				itemName: item.itemName,
				itemThumbnail: item.itemThumbnail,
				itemType: item.itemType,
				isLaunched: item.isLaunched,
				amount: item.amount
			});
			return acc;
		}, {}));

		res.status(200).json({ status: true, data });
	} catch (error) {
		console.error("Encountered an error while fetching user orders: ", error);
		return res.status(500).json({
			status: false, message: "Something went wrong."
		});
	}
}

exports.addToCart = async (req, res, next) => {
	try {
		const userId = req.userId;

		let orderDetailsCreateObj = { userId };

		const { courseId, assessmentId, jobId } = req.body;

		if (!courseId && !assessmentId) {
			return res.status(422).json({ status: false, message: "Provide either courseId or assessmentId." });
		}

		if (courseId && assessmentId) {
			return res.status(422).json({ status: false, message: "Both Course & Assessment can not be added to cart at once." });
		}

		let fetchOrderDetailsQuery = `
			SELECT * FROM order_details od 
			JOIN orders o ON o.orderId = od.orderId
			WHERE od.userId = ${userId} AND o.paymentStatus = "Pending"
		`;

		if (courseId) {
			orderDetailsCreateObj.courseId = courseId;
			const courseInfo = await courses.findOne({ where: { courseId } });
			if (!courseInfo) {
				return res.status(404).json({ status: false, message: "Course not found." });
			}
			if (courseInfo.courseAccessType === "Free") {
				return res.status(404).json({ status: false, message: "Course is free to access." });
			}
			fetchOrderDetailsQuery += ` AND od.courseId = ${courseInfo.courseId};`;
			itemType = "Course";
			itemName = courseInfo.courseName
			amount = courseInfo.price;
		} else {
			if (!jobId) {
				return res.status(422).json({ status: false, message: "Provide either jobId." });
			}

			var jobData = await jobs.findOne({ where: { jobId }, attributes: ['jobTitle'] })
			if (!jobData) {
				return res.status(404).json({ status: false, message: "Job not found." });
			}
			itemName = jobData.jobTitle;

			orderDetailsCreateObj.assessmentId = assessmentId;
			orderDetailsCreateObj.jobId = jobId;

			let query = `
				SELECT *
				FROM job_assessments ja
				JOIN assessments a ON ja.assessmentId = a.assessmentId
				WHERE a.assessmentId = :assessmentId;
			`;
			const jobAssessmentInfo = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT, replacements: { assessmentId } });
			if (!jobAssessmentInfo.length) {
				return res.status(404).json({ status: false, message: "Job Assessment not found." });
			}
			if (jobAssessmentInfo[0].assessmentFeeType === "Free") {
				return res.status(404).json({ status: false, message: "Assessment is free to access." });
			}
			fetchOrderDetailsQuery += ` AND od.assessmentId = ${jobAssessmentInfo[0].assessmentId};`;
			itemType = "Assessment";
			amount = jobAssessmentInfo[0].price;
		}

		const fetchOrderDetails = await sequelize.query(fetchOrderDetailsQuery, {
			type: sequelize.QueryTypes.SELECT
		});
		if (fetchOrderDetails.length) {
			return res.status(422).json({ status: false, message: "Already added to cart." });
		}

		const pendingOrder = await orders.findOne({ where: { userId, paymentStatus: "Pending" } });

		if (pendingOrder) {
			orderId = pendingOrder.orderId;
			orderAmount = parseFloat(pendingOrder.orderAmount) + parseFloat(amount);
			await orders.update({ orderAmount }, { where: { orderId: pendingOrder.orderId } });
		} else {
			// generate unique order id
			let uniqueOrderId = null;
			let isUnique = false;
			do {
				uniqueOrderId = generateUniqueOrderId();
				// skipping if a unique id is not generated for any reason
				if (!uniqueOrderId) {
					continue;
				}
				const existingUser = await orders.findOne({ where: { uniqueOrderId } });
				if (!existingUser) {
					isUnique = true;
				}
			} while (!isUnique);

			let newOrder = await orders.create({ userId, uniqueOrderId, orderAmount: parseFloat(amount), paymentStatus: "Pending" });
			orderId = newOrder.orderId
		}

		orderDetailsCreateObj.orderId = orderId;
		await orderDetails.create({ ...orderDetailsCreateObj, itemType, amount, itemName });

		res.status(200).json({ status: true, message: "Added to cart." });
	} catch (error) {
		console.error("Encountered an error while adding item to cart: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
};

const createAssessmentName = (goalName, jobTitle, skillName) => {
	// const formatName = (name) => name ? name.split(' ').join('_') : '';

	if (jobTitle) {
		return `${jobTitle}${skillName ? ' > ' + skillName : ''}`;
	} else if (goalName) {
		return `${goalName}${skillName ? ' > ' + skillName : ''}`;
	} else {
		return skillName;
	}
};

exports.addAssessmentToCart = async (req, res, next) => {
	try {
		const userId = req.userId;

		let orderDetailsCreateObj = { userId };

		let { courseId, assessmentId, jobId, goalId, categoryId, subCategoryId, skillId } = req.body;

		if (!courseId && !goalId && !jobId && !skillId) {
			return res.status(422).json({ status: false, message: "Provide either courseId or jobId or goalId or skillId." });
		}

		if (courseId && goalId) {
			return res.status(422).json({ status: false, message: "Both Course & Assessment can not be added to cart at once." });
		}

		let fetchOrderDetailsQuery = `
			SELECT * FROM order_details od 
			JOIN orders o ON o.orderId = od.orderId
			WHERE od.userId = ${userId} AND o.paymentStatus = "Pending"
		`;

		let amount;
		let itemType;
		let itemName;

		let skillIds = []
		let requiredSkillIds = [];
		if (courseId) {
			orderDetailsCreateObj.courseId = courseId;
			const courseInfo = await courses.findOne({ where: { courseId } });
			if (!courseInfo) {
				return res.status(404).json({ status: false, message: "Course not found." });
			}
			if (courseInfo.courseAccessType === "Free") {
				return res.status(404).json({ status: false, message: "Course is free to access." });
			}
			fetchOrderDetailsQuery += ` AND od.courseId = ${courseInfo.courseId};`;
			itemType = "Course";
			amount = courseInfo.price;
		} else {
			let assessmentWhereCondition = {};

			if (!goalId && !jobId && !skillId) {
				return res.status(422).json({ status: false, message: "Provide either Goal ID or Job ID or Skill ID" });
			}

			if (!skillId) {
				if (!goalId && !jobId) {
					return res.status(422).json({ status: false, message: "Provide either Goal ID or Job ID" });
				}
				if (!goalId) {
					let fetchJobGoal = await jobGoals.findOne({ where: { jobId: jobId } });
					if (fetchJobGoal) {
						goalId = fetchJobGoal.goalId;
					} else {
						return res.status(404).json({ status: false, message: "Job Goal Id not found." });
					}
				}
			}

			let goalData;
			if (goalId) {
				goalData = await goals.findOne({ where: { goalId }, attributes: ['goalName'] })
				if (!goalData) {
					return res.status(404).json({ status: false, message: "Goal not found." });
				}
			}

			if (skillId) {
				const skillsData = await skills.findOne({ where: { skillId }, attributes: ['skillName'] })
				if (!skillsData) {
					return res.status(404).json({ status: false, message: "Skill not found." });
				}
				assessmentWhereCondition.skillId = skillId;

				fetchOrderDetailsQuery += ` AND od.skillId = ${skillId} AND od.subCategoryId IS NULL AND od.categoryId IS NULL AND od.goalId IS NULL AND od.jobId IS NULL`;
				skillIds = [skillId];
				itemName = createAssessmentName(goalData?.goalName, null, skillsData.skillName) // TODO
			} else if (subCategoryId) {
				if (!categoryId || !goalId) {
					return res.status(422).json({ status: false, message: "SubCategoryId & CategoryId are required." });
				}

				const subCategoryData = await subCategories.findOne({ where: { subCategoryId }, attributes: ['subCategoryName'] })
				if (!subCategoryData) {
					return res.status(404).json({ status: false, message: "SubCategory not found." });
				}

				const categoryData = await categories.findOne({ where: { categoryId }, attributes: ['categoryName'] })
				if (!categoryData) {
					return res.status(404).json({ status: false, message: "Category not found." });
				}

				assessmentWhereCondition.subCategoryId = subCategoryId;
				assessmentWhereCondition.categoryId = categoryId;
				assessmentWhereCondition.goalId = goalId;

				fetchOrderDetailsQuery += ` AND od.skillId IS NULL AND od.subCategoryId = ${subCategoryId} AND od.categoryId = ${categoryId} AND od.goalId = ${goalId}`;
				if (jobId) {
					var jobData = await jobs.findOne({ where: { jobId }, attributes: ['jobTitle'] })
					if (!jobData) {
						return res.status(404).json({ status: false, message: "Job not found." });
					}
					assessmentWhereCondition.jobId = jobId;
					fetchOrderDetailsQuery += ` AND od.jobId = ${jobId}`;
					roadmapQuery = `
						SELECT JSON_ARRAYAGG(js.skillId) as skillIds
						FROM goal_road_maps grm
						JOIN job_skills js ON js.skillId = grm.skillId
						WHERE js.jobId = :jobId AND grm.categoryId = :categoryId AND grm.subCategoryId = :subCategoryId AND grm.goalId = :goalId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
						;
					`;
				} else {
					fetchOrderDetailsQuery += ` AND od.jobId IS NULL`;
					roadmapQuery = `
						SELECT JSON_ARRAYAGG(grm.skillId) as skillIds
						FROM goal_road_maps grm
						WHERE grm.goalId = :goalId AND grm.categoryId = :categoryId AND grm.subCategoryId = :subCategoryId;
					`;
				}
				
				const replacements = {goalId, categoryId, subCategoryId, userId};
				if(jobId) {
					replacements.jobId = jobId;
				}

				const subCategorySkillIds = await sequelize.query(roadmapQuery, {
					type: sequelize.QueryTypes.SELECT,
					replacements
				});

				skillIds = subCategorySkillIds[0].skillIds;
				if (!skillIds || !skillIds.length) {
					return res.status(404).json({ status: false, message: "No skills found for the specified criteria." });
				}
				itemName = createAssessmentName(goalData.goalName, jobData ? jobData.jobTitle : null, subCategoryData.subCategoryName)
			} else if (categoryId) {
				const categoryData = await categories.findOne({ where: { categoryId }, attributes: ['categoryName'] })
				if (!categoryData) {
					return res.status(404).json({ status: false, message: "Category not found." });
				}

				assessmentWhereCondition.categoryId = categoryId;
				assessmentWhereCondition.goalId = goalId;

				fetchOrderDetailsQuery += ` AND od.skillId IS NULL AND od.subCategoryId IS NULL AND od.categoryId = ${categoryId} AND od.goalId = ${goalId}`;
				if (jobId) {
					var jobData = await jobs.findOne({ where: { jobId }, attributes: ['jobTitle'] })
					if (!jobData) {
						return res.status(404).json({ status: false, message: "Job not found." });
					}

					assessmentWhereCondition.jobId = jobId;
					fetchOrderDetailsQuery += ` AND od.jobId = ${jobId}`;
					
					roadmapQuery = `
						SELECT JSON_ARRAYAGG(js.skillId) as skillIds
						FROM goal_road_maps grm
						JOIN job_skills js ON js.skillId = grm.skillId
						WHERE js.jobId = :jobId AND grm.categoryId = :categoryId AND grm.goalId = :goalId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
						;
					`;
				} else{
					fetchOrderDetailsQuery += ` AND od.jobId IS NULL`;
					roadmapQuery = `
						SELECT JSON_ARRAYAGG(grm.skillId) as skillIds
						FROM goal_road_maps grm
						WHERE grm.goalId = :goalId AND grm.categoryId = :categoryId;
					`;
				}

				const replacements = {goalId, categoryId};
				if(jobId) {
					replacements.jobId = jobId;
				}
				const categorySkillIds = await sequelize.query(roadmapQuery, {
					type: sequelize.QueryTypes.SELECT,
					replacements
				});

				skillIds = categorySkillIds[0].skillIds;
				if (!skillIds || !skillIds.length) {
					return res.status(404).json({ status: false, message: "No skills found for the specified criteria." });
				}
				itemName = createAssessmentName(goalData.goalName, jobData ? jobData.jobTitle : null, categoryData.categoryName)
			} else if (jobId) {
				var jobData = await jobs.findOne({ where: { jobId }, attributes: ['jobTitle'] })
				if (!jobData) {
					return res.status(404).json({ status: false, message: "Job not found." });
				}

				assessmentWhereCondition.jobId = jobId;
				assessmentWhereCondition.goalId = goalId;

				fetchOrderDetailsQuery += ` AND od.skillId IS NULL AND od.subCategoryId IS NULL AND od.categoryId IS NULL AND od.jobId = ${jobId} AND od.goalId = ${goalId}`;

				roadmapQuery = `
					SELECT JSON_ARRAYAGG(js.skillId) as skillIds
					FROM goal_road_maps grm
					JOIN job_skills js ON js.skillId = grm.skillId
					WHERE js.jobId = :jobId AND grm.goalId = :goalId AND (grm.categoryId NOT IN (1, 2) OR js.isGoatSkill = true)
					;
				`;

				const replacements = {jobId, goalId};
				const jobSkillIds = await sequelize.query(roadmapQuery, {
					type: sequelize.QueryTypes.SELECT,
					replacements
				});

				skillIds = jobSkillIds[0].skillIds;
				if (!skillIds || !skillIds.length) {
					return res.status(404).json({ status: false, message: "No skills found for the specified criteria." });
				}
				itemName = createAssessmentName(goalData.goalName, jobData ? jobData.jobTitle : null)
			} else if (goalId) {
				assessmentWhereCondition.goalId = goalId;
				
				fetchOrderDetailsQuery += ` AND od.skillId IS NULL AND od.subCategoryId IS NULL AND od.categoryId IS NULL AND od.jobId IS NULL AND od.goalId = ${goalId}`;

				roadmapQuery = `
					SELECT JSON_ARRAYAGG(grm.skillId) as skillIds
					FROM goal_road_maps grm
					WHERE grm.goalId = :goalId;
				`;

				const replacements = {goalId};
				const goalSkillIds = await sequelize.query(roadmapQuery, {
					type: sequelize.QueryTypes.SELECT,
					replacements
				});

				skillIds = goalSkillIds[0].skillIds;
				if (!skillIds || !skillIds.length) {
					return res.status(404).json({ status: false, message: "No skills found for the specified criteria." });
				}
				itemName = createAssessmentName(goalData.goalName)
			}

			const fetchOrderDetails = await sequelize.query(fetchOrderDetailsQuery, {
				type: sequelize.QueryTypes.SELECT
			});
			if (fetchOrderDetails.length) {
				return res.status(422).json({ status: false, message: "Already added to cart." });
			}

			orderDetailsCreateObj = { ...orderDetailsCreateObj, ...assessmentWhereCondition, itemName }
			skillIds = [...new Set(skillIds)];

			
			let jobSkillQuery;
			let jobSkillReplacements = {};
			// TODO levels
			if (jobId) {
				jobSkillQuery = `
					SELECT 
						JSON_ARRAYAGG(js.skillId) AS skillIds
					FROM job_skills js
					LEFT JOIN user_skills us ON us.skillId = js.skillId AND us.userId = :userId
					LEFT JOIN user_skill_levels usl ON usl.skillId = js.skillId AND usl.userId = :userId
						AND (
							(js.requiredSkillLevel = 5 AND usl.level = 'BEGINNER') OR
							(js.requiredSkillLevel = 7 AND usl.level = 'INTERMEDIATE') OR
							(js.requiredSkillLevel = 9 AND usl.level = 'ADVANCED')
						)
					WHERE js.jobId = :jobId 
						AND js.skillId IN (:skillIds)
						AND (us.acquiredLevel IS NULL OR us.acquiredLevel < js.requiredSkillLevel)
						AND (usl.acquiredLevel IS NULL OR usl.acquiredLevel < js.requiredSkillLevel);
				`;

				jobSkillReplacements = { jobId, skillIds, userId };
			} else {
				jobSkillQuery = `
					SELECT 
						JSON_ARRAYAGG(skills.skillId) AS skillIds
					FROM (SELECT skillId FROM JSON_TABLE(:skillIds, "$[*]" COLUMNS (skillId INT PATH "$")) AS jt) AS skills
					LEFT JOIN user_skills us ON skills.skillId = us.skillId AND us.userId = :userId
					LEFT JOIN user_skill_levels usl 
						ON skills.skillId = usl.skillId AND usl.userId = :userId AND usl.level = 'ADVANCED'
					WHERE 
						(us.skillId IS NULL OR us.acquiredLevel IS NULL OR us.acquiredLevel < 9)
						AND (usl.skillId IS NULL OR usl.acquiredLevel IS NULL OR usl.acquiredLevel < 9);
				`
				jobSkillReplacements = { skillIds: JSON.stringify(skillIds), userId };
			}

			const jobSkillData = await sequelize.query(jobSkillQuery, {
				type: sequelize.QueryTypes.SELECT,
				replacements: jobSkillReplacements
			});

			requiredSkillIds = jobSkillData[0]?.skillIds || [];
			requiredSkillIds = [...new Set(requiredSkillIds)];
			
			let whereCondition = {};
			if (skillId) {
				whereCondition = { skillId, categoryId: null, subCategoryId: null, jobId: null, goalId: null };
			} else {
				whereCondition = { goalId, skillId: { [Sequelize.Op.in]: requiredSkillIds }, jobId: jobId || null };
			}
			
			if (!requiredSkillIds || !requiredSkillIds.length) {
				return res.status(200).json({ status: true, message: "User already qualified for the assessment." });
			}

			const assessmentPricingData = await assessmentConfigs.findOne({
				where: whereCondition,
				attributes: [[sequelize.fn('SUM', sequelize.col('credits')), 'totalCredits']],
				raw: true
			});
			const totalCredits = assessmentPricingData.totalCredits || 0;

			itemType = "Assessment";
			amount = totalCredits;
		}

		const pendingOrder = await orders.findOne({ where: { userId, paymentStatus: "Pending" } });

		if (pendingOrder) {
			orderId = pendingOrder.orderId;
			orderAmount = parseFloat(pendingOrder.orderAmount) + parseFloat(amount);
			await orders.update({ orderAmount }, { where: { orderId: pendingOrder.orderId } });
		} else {
			// generate unique order id
			let uniqueOrderId = null;
			let isUnique = false;
			do {
				uniqueOrderId = generateUniqueOrderId();
				// skipping if a unique id is not generated for any reason
				if (!uniqueOrderId) {
					continue;
				}
				const existingUser = await orders.findOne({ where: { uniqueOrderId } });
				if (!existingUser) {
					isUnique = true;
				}
			} while (!isUnique);

			let newOrder = await orders.create({ userId, uniqueOrderId, orderAmount: parseFloat(amount), paymentStatus: "Pending" });
			orderId = newOrder.orderId
		}

		orderDetailsCreateObj.orderId = orderId;
		await orderDetails.create({ ...orderDetailsCreateObj, itemType, assessmentSkillIds: requiredSkillIds, amount });

		res.status(200).json({ status: true, message: "Added to cart." });
	} catch (error) {
		console.error("Encountered an error while adding item to cart: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
};

exports.removeFromCart = async (req, res, next) => {
	try {
		let userId = req.userId;
		let { itemId, itemType } = req.query;
		itemId = +itemId;

		let orderDetailsWhereCondition = { userId, itemType };

		const pendingOrder = await orders.findOne({ where: { userId, paymentStatus: "Pending" } });

		if (!pendingOrder) {
			return res.status(404).json({ status: false, message: "No pending order found." });
		}

		orderDetailsWhereCondition.orderId = pendingOrder.orderId;

		if (itemType === "Course") {
			const courseInfo = await courses.findOne({ where: { courseId: itemId } });
			if (!courseInfo) {
				return res.status(404).json({ status: false, message: "Course not found." });
			}
			orderDetailsWhereCondition.courseId = itemId;
		}

		if (itemType === "Assessment") {
			orderDetailsWhereCondition.orderDetailId = itemId;
		}

		let fetchOrderDetails = await orderDetails.findOne({ where: orderDetailsWhereCondition });
		if (!fetchOrderDetails) {
			return res.status(404).json({ status: false, message: "Item not found in cart." });
		}

		await orderDetails.destroy({ where: orderDetailsWhereCondition });

		let remainingOrderDetails = await orderDetails.findAll({
			where: { orderId: pendingOrder.orderId }
		});

		if (!remainingOrderDetails.length) {
			await orders.destroy({ where: { orderId: pendingOrder.orderId } });
		} else {
			let orderAmount = remainingOrderDetails.reduce(
				(acc, item) => acc + parseFloat(item.amount),
				0,
			);

			await orders.update(
				{ orderAmount },
				{ where: { orderId: pendingOrder.orderId } },
			);
		}

		res.status(200).json({ status: true, message: "Removed from cart." });
	} catch (error) {
		console.error("Encountered an error while removing item from cart.", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
}

exports.paymentLink = async (req, res, next) => {
	try {
		let userId = req.userId;
		let { orderId, orderAmount, couponId = null } = req.body;

		if (!orderId) {
			return res.status(400).json({ status: false, message: "Order Id must be provided." });
		}

		const userInfo = await users.findOne({ where: { userId } });
		if (!userInfo) {
			return res.status(404).json({ status: false, message: "User not found." });
		}

		const studentInfo = await students.findOne({ where: { userId } });
		if (!studentInfo) {
			return res.status(404).json({ status: false, message: "Student not found." });
		}

		const pendingOrder = await orders.findOne({ where: { userId, orderId, paymentStatus: "Pending" } });
		if (!pendingOrder) {
			return res.status(404).json({ status: false, message: "No order found." });
		}

		let paymentFor = "JCurve Cart";
		let description = `Payment For JCurve Cart Items.`;
		let discountAmount = 0;
		let originalAmount = pendingOrder.orderAmount;

		if (couponId) {
			const couponInfo = await coupons.findOne({
				where: {
					couponId, isActive: 1,
					couponCount: { [Op.gt]: 0 },
					couponsRemaining: { [Op.gt]: 0 },
					expiryDate: { [Op.gt]: new Date() }
				}
			});

			if (!couponInfo) {
				return res.status(422).json({ status: false, message: "Invalid coupon." });
			}

			// checking if coupon is applicable to jobAssessmentId
			if (couponInfo.isAssessmentSpecific) {
				let query = `
					SELECT
						od.*
					FROM order_details od
					JOIN assessments a ON od.assessmentId = a.assessmentId
					WHERE od.orderId = ${orderId} AND a.assessmentId = ${couponInfo.assessmentId};
				`;
				const isCouponApplicableToProvidedJobAssessmentId = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
				if (!isCouponApplicableToProvidedJobAssessmentId.length) {
					return res.status(422).json({ status: false, message: "Coupon not applicable." });
				}
			}
			// END

			const couponUsed = await couponRedemptions.findOne({ where: { userId, couponId } });

			if (couponUsed) {
				return res.status(422).json({ status: false, message: "Coupon already redeemed." });
			}

			let { discountType, discountValue } = couponInfo;

			if (discountType === 'Percentage') {
				discountAmount = parseFloat(((originalAmount * discountValue) / 100).toFixed(2));
			} else {
				discountAmount = discountValue;
			}
		}

		let finalAmount = originalAmount - discountAmount;

		// if (finalAmount != orderAmount) {
		// 	return res.status(422).json({ status: false, message: "Order amount mismatch." });
		// }

		if (couponId && !finalAmount) {

			const createPayment = await payments.create({
				userId, couponId, originalAmount, discountAmount, finalAmount,
				paidFor: "CartItems",
				paymentMode: null,
				jcurvePaymentId: `jpay-${crypto.randomUUID()}`,
				razorpayPaymentLinkId: null,
				paymentLink: null,
				paymentStatus: "Paid"
			});
			await orders.update({ paymentId: createPayment.paymentId, paymentStatus: "Completed" }, { where: { userId, paymentStatus: "Pending" } });

			await couponRedemptions.create({ userId, orderId, couponId });
			const couponInfo = await coupons.findOne({ where: { couponId } });
			let { couponsRemaining } = couponInfo;
			couponsRemaining--;
			await coupons.update({ couponsRemaining }, { where: { couponId } });

			// inviting & generating Testlify assessment Link
			const orderItems = await orderDetails.findAll({ where: { orderId } });

			for (let i = 0; i < orderItems.length; i++) {
				if (orderItems[i].itemType == "Assessment") {
					const assessmentInfo = await assessments.findOne({ where: { assessmentId: orderItems[i].assessmentId } });

					sendAssessmentMail("Paid", userInfo.email, studentInfo.firstName, assessmentInfo.assessmentName);

					let userAssessmentsCount = await userAssessments.findAll({ where: { userId } });
					maskedEmail = userInfo.uniqueId + "_" + userAssessmentsCount.length + "@jcurve.tech";

					let invite = await axios.post('https://api.testlify.com/v1/assessment/candidate/invites', {
						"candidateInvites": [
							{
								"firstName": studentInfo.firstName,
								"lastName": studentInfo.lastName,
								"email": maskedEmail,
								"phoneExt": 91,
								"phone": 0
							}
						],
						"assessmentId": assessmentInfo.vendorAssessmentId
					}, {
						headers: {
							'content-type': 'application/json',
							'Authorization': `Bearer ${process.env.TESTLIFY_ACCESS_TOKEN}`
						}
					});

					if (invite.data.totalInvalid == 0 && invite.data.data[0].status == "VALID") {
						const link = await axios.post(`https://api.testlify.com/v1/assessment/${assessmentInfo.vendorAssessmentId}/candidate/link`, {
							"email": maskedEmail,
						}, {
							headers: {
								'content-type': 'application/json',
								'Authorization': `Bearer ${process.env.TESTLIFY_ACCESS_TOKEN}`
							}
						});

						let userAssessmentsData = {
							assessmentId: assessmentInfo.assessmentId,
							userId,
							jobId: orderItems[i].jobId,
							assessmentCategory: assessmentInfo.assessmentCategory,
							assessmentProvider: "Testlify",
							testlifyAssessmentDetailsId: link.data.id,
							testlifyAssessmentEmail: link.data.email,
							vendorAssessmentId: link.data.assessmentId,
							assessmentLink: link.data.inviteLink,
							assessmentType: assessmentInfo.type,
							assessmentStatus: "INVITED",
							paymentId: createPayment.paymentId,
							assessmentFeeType: assessmentInfo.assessmentFeeType
						}
						await userAssessments.create(userAssessmentsData);

						let { id, orgId, assessmentId, assessmentCandidateId, email, shortId, inviteKey, inviteLink, isExpired, lastModifiedBy, isPublic, type, timeObject, invitationLinkValidityStartDate, invitationLinkValidityEndDate, source, isPreview, created, modified, deleted } = link.data;

						await assessmentInvitationDetails.create({
							testlifyId: id,
							orgId,
							userId: link.data.userId,
							assessmentId, assessmentCandidateId, email, shortId, inviteKey, inviteLink, isExpired, lastModifiedBy, isPublic, type, timeObject, invitationLinkValidityStartDate, invitationLinkValidityEndDate, source, isPreview, created, modified, deleted
						});
					}
				}
			}
			// END - Testlify assessment Link

			return res.status(200).json({
				status: true,
				data: {
					paymentLink: process.env.WEB_HOST_URL + "app/order-details?orderId=" + pendingOrder.uniqueOrderId + "&razorpay_payment_link_status=paid"
				},
				message: "Payment Successful."
			});
		}

		let amountInRazorpayFormat = finalAmount * 100; // amount to be passed in paise
		let data = null;
		try {
			data = await createRazorpayLink(userInfo, paymentFor, amountInRazorpayFormat, description);
		} catch (error) {
			console.error("Encountered an error while creating razorpay payment link: ", error)
			return res.status(500).json({
				status: false,
				message: "Something went wrong!"
			});
		}

		if (data.statusCode == 400) {
			return res.status(data.statusCode).json({ status: false, message: data.error.description, data: data.error });
		} else {
			const createPayment = await payments.create({
				userId, couponId: couponId || null, originalAmount, discountAmount, finalAmount,
				paidFor: "CartItems",
				paymentMode: "Razorpay",
				jcurvePaymentId: `jpay-${crypto.randomUUID()}`,
				razorpayPaymentLinkId: data.id,
				paymentLink: data.short_url,
				paymentStatus: "Initiated"
			});
			await orders.update({ paymentId: createPayment.paymentId }, { where: { userId, paymentStatus: "Pending" } });
			return res.status(200).json({ status: true, data: { paymentLink: data.short_url } });
		}
	} catch (error) {
		console.error("Encountered an error while creating payment link: ", error);
		return res.status(500).json({ status: false, message: "Somthing went wrong." });
	}
};

exports.rechargeWallet = async (req, res, next) => {
	try {
		let userId = req.userId;
		let { amount } = req.body;
		let decodedAmount = atob(amount);
		let originalAmount = parseInt(decodedAmount);

		const userInfo = await users.findOne({ where: { userId } });
		if (!userInfo) {
			return res.status(404).json({ status: false, message: "User not found." });
		}

		let paymentFor = "JCurve Credits";
		let description = `Wallet Recharge Of JCurve Credits.`;
		let amountInRazorpayFormat = originalAmount * 100; // amount to be passed in paise
		let data = null;

		try {
			data = await createRazorpayLink(userInfo, paymentFor, amountInRazorpayFormat, description);
		} catch (error) {
			console.error("Encountered an error while creating razorpay payment link: ", error)
			return res.status(500).json({ status: false, message: "Something went wrong!" });
		}

		if (data.statusCode == 400) {
			return res.status(data.statusCode).json({ status: false, message: data.error.description, data: data.error });
		} else {
			await payments.create({
				userId,
				couponId: null,
				originalAmount,
				discountAmount: 0,
				finalAmount: originalAmount,
				paidFor: "WalletRecharge",
				paymentMode: "Razorpay",
				jcurvePaymentId: `jpay-${crypto.randomUUID()}`,
				razorpayPaymentLinkId: data.id,
				paymentLink: data.short_url,
				paymentStatus: "Initiated"
			});
			return res.status(200).json({ status: true, data: { paymentLink: data.short_url } });
		}
	} catch (error) {
		console.error("Encountered an error while creating payment link: ", error);
		return res.status(500).json({ status: false, message: "Somthing went wrong." });
	}
};

exports.getOrderDetails = async (req, res, next) => {
	try {
		let userId = req.userId;
		let { orderId, jcurvePaymentId, razorpayPaymentLinkId } = req.query;

		if (!jcurvePaymentId && !orderId && !razorpayPaymentLinkId) {
			return res.status(422).json({ status: false, message: "Either JCurve Payment ID or Order ID or razorpay Payment Link Id is required." });
		}

		let orderData = null;
		let paymentData = null;

		if (orderId) {
			orderData = await orders.findOne({ where: { userId, uniqueOrderId: orderId, paymentStatus: "Completed" } });
			if (!orderData) {
				return res.status(404).json({ success: false, message: "order data not found." });
			}
			paymentData = await payments.findOne({ where: { userId, paymentId: orderData.paymentId } });
			if (!paymentData) {
				return res.status(404).json({ success: false, message: "order data not found." });
			}
		}

		if (jcurvePaymentId) {
			paymentData = await payments.findOne({ where: { userId, jcurvePaymentId } });
			if (!paymentData) {
				return res.status(404).json({ status: false, message: "Order data not found." });
			}
			orderData = await orders.findOne({ where: { userId, paymentId: paymentData.paymentId } });
			if (!orderData) {
				return res.status(404).json({ status: false, message: "order data not found." });
			}
		}

		if (razorpayPaymentLinkId) {
			paymentData = await payments.findOne({ where: { userId, razorpayPaymentLinkId } });
			if (!paymentData) {
				return res.status(404).json({ status: false, message: "Order data not found." });
			}
			orderData = await orders.findOne({ where: { userId, paymentId: paymentData.paymentId } });
			if (!orderData) {
				return res.status(404).json({ status: false, message: "order data not found." });
			}
		}

		let assessmentImageLink = process.env.API_HOST_URL + "assessment-logo.png";

		let itemsQuery = `
			SELECT
				IF(od.courseId, c.courseId, od.orderDetailId) AS itemId,
				IF(od.courseId, c.courseName, od.itemName) AS itemName,
				IF(od.courseId, c.thumbnail, "${assessmentImageLink}") AS itemThumbnail,
				od.itemType, od.amount, od.currencyCode,
				COALESCE(
					JSON_ARRAYAGG(
						JSON_OBJECT(
							'userAssessmentId', ua.userAssessmentId,
							'assessmentName', ua.assessmentName,
							'assessmentStatus', ua.assessmentStatus
						)
					),
					JSON_ARRAY()
				) AS assessments
			FROM order_details od
			JOIN orders o ON o.orderId = od.orderId
			LEFT JOIN courses c ON c.courseId = od.courseId
			LEFT JOIN user_assessments ua ON od.orderDetailId = ua.orderDetailId
			WHERE od.userId = ${userId} and o.orderId = ${orderData.orderId}
			GROUP BY od.orderDetailId`;

		const cartItems = await sequelize.query(itemsQuery, { type: sequelize.QueryTypes.SELECT });

		let data = {
			orderId: orderData.uniqueOrderId,
			originalAmount: paymentData.originalAmount,
			discountAmount: paymentData.discountAmount,
			finalAmount: paymentData.finalAmount,
			currencyCode: paymentData.currencyCode,
			razorpayPaymentId: paymentData.razorpayPaymentId,
			jcurvePaymentId: paymentData.jcurvePaymentId,
			paymentMode: paymentData.paymentMode,
			razorpayPaymentLinkId: paymentData.razorpayPaymentLinkId,
			paymentStatus: orderData.paymentStatus,
			orderTimestamp: orderData.updatedAt,
			cartItems
		}

		res.status(200).json({ status: true, data });
	} catch (error) {
		console.error("Encountered an error while fetching order details: ", error);
		return res.status(500).json({ status: false, message: "Something went wrong." });
	}
}

exports.razorpayWebhook = async (req, res, next) => {
	try {
		const data = req.body;
		let paymentStatus = data.event.split('.')[1];
		paymentStatus = paymentStatus.charAt(0).toUpperCase() + paymentStatus.substring(1);

		const paymentInfo = await payments.findOne({ where: { razorpayPaymentLinkId: data.payload.payment_link.entity.id, paymentStatus: "Initiated" } });

		if (paymentInfo) {
			let { paymentId, userId, couponId, originalAmount, discountAmount, finalAmount, paidFor, jcurvePaymentId } = paymentInfo;

			razorpayWebhookDetails.create({ paymentId, status: paymentStatus, data });
			await payments.update({ paymentStatus, razorpayPaymentId: data.payload.payment.entity.id }, { where: { razorpayPaymentLinkId: data.payload.payment_link.entity.id } });
			const userInfo = await users.findOne({ where: { userId } });
			if (paidFor == "CartItems") {
				const studentInfo = await students.findOne({ where: { userId } });
				const email = userInfo.email;

				const order = await orders.findOne({ where: { paymentId } });
				const orderItems = await orderDetails.findAll({ where: { orderId: order.orderId } });

				for (let i = 0; i < orderItems.length; i++) {
					if (orderItems[i].itemType == "Course") {
						const courseInfo = await courses.findOne({ where: { courseId: orderItems[i].courseId } });
						sendCourseMail(paymentStatus, email, studentInfo.firstName, courseInfo.courseName);
					} else if (orderItems[i].itemType == "Assessment") {
						const assessmentInfo = await assessments.findOne({ where: { assessmentId: orderItems[i].assessmentId } });

						sendAssessmentMail(paymentStatus, email, studentInfo.firstName, assessmentInfo.assessmentName);

						if (paymentStatus == "Paid") {
							// inviting & generating Testlify assessment Link
							let userAssessmentsCount = await userAssessments.findAll({ where: { userId } });
							maskedEmail = userInfo.uniqueId + "_" + userAssessmentsCount.length + "@jcurve.tech";

							let invite = await axios.post('https://api.testlify.com/v1/assessment/candidate/invites', {
								"candidateInvites": [
									{
										"firstName": studentInfo.firstName,
										"lastName": studentInfo.lastName,
										"email": maskedEmail,
										"phoneExt": 91,
										"phone": 0
									}
								],
								"assessmentId": assessmentInfo.vendorAssessmentId
							}, {
								headers: {
									'content-type': 'application/json',
									'Authorization': `Bearer ${process.env.TESTLIFY_ACCESS_TOKEN}`
								}
							});

							if (invite.data.totalInvalid == 0 && invite.data.data[0].status == "VALID") {
								const link = await axios.post(`https://api.testlify.com/v1/assessment/${assessmentInfo.vendorAssessmentId}/candidate/link`, {
									"email": maskedEmail,
								}, {
									headers: {
										'content-type': 'application/json',
										'Authorization': `Bearer ${process.env.TESTLIFY_ACCESS_TOKEN}`
									}
								});

								let userAssessmentsData = {
									assessmentId: assessmentInfo.assessmentId,
									userId,
									jobId: orderItems[i].jobId,
									assessmentCategory: assessmentInfo.assessmentCategory,
									assessmentProvider: "Testlify",
									testlifyAssessmentDetailsId: link.data.id,
									testlifyAssessmentEmail: link.data.email,
									vendorAssessmentId: link.data.assessmentId,
									assessmentLink: link.data.inviteLink,
									assessmentType: assessmentInfo.type,
									assessmentStatus: "INVITED",
									paymentId,
									assessmentFeeType: assessmentInfo.assessmentFeeType
								}

								await userAssessments.create(userAssessmentsData);

								let { id, orgId, assessmentId, assessmentCandidateId, email, shortId, inviteKey, inviteLink, isExpired, lastModifiedBy, isPublic, type, timeObject, invitationLinkValidityStartDate, invitationLinkValidityEndDate, source, isPreview, created, modified, deleted } = link.data;

								await assessmentInvitationDetails.create({
									testlifyId: id,
									orgId,
									userId: link.data.userId,
									assessmentId, assessmentCandidateId, email, shortId, inviteKey, inviteLink, isExpired, lastModifiedBy, isPublic, type, timeObject, invitationLinkValidityStartDate, invitationLinkValidityEndDate, source, isPreview, created, modified, deleted
								});
							}
						}
					}
				}

				if (couponId) {
					if (paymentStatus == "Paid") {
						await couponRedemptions.findOrCreate({ where: { userId, orderId: order.orderId, couponId } });
						const couponInfo = await coupons.findOne({ where: { couponId } });
						let { couponsRemaining } = couponInfo;
						couponsRemaining--;
						await coupons.update({ couponsRemaining }, { where: { couponId } });
					}
				}

				if (paymentStatus == "Paid") {
					await orders.update({ paymentStatus: "Completed" }, { where: { paymentId } });
				}
			} else if (paidFor == "WalletRecharge") {
				if (paymentStatus == "Paid") {
					oldAmount = userInfo.jcurveCredits ? atob(userInfo.jcurveCredits) : 0;
					updatedCredits = parseInt(oldAmount) + parseInt(finalAmount);
					await users.update({ jcurveCredits: btoa(updatedCredits) }, { where: { userId } });
					await walletTransactions.create({ userId, transactionType: "CREDIT", amount: finalAmount, referencePaymentId: jcurvePaymentId, paymentInfo: "WALLET_RECHARGE" });
				}
			}
		}
		return res.status(200).json({ status: true });
	} catch (error) {
		console.error("Error in razorpay webhook: ", error);
		return res.status(200).json({ status: true });
	}
}
