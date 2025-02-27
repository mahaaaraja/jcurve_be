const jwt = require("jsonwebtoken");
const userAuthTokens = require('../models/userAuthTokens.js');
const students = require('../models/students.js');
const users = require('../models/users.js');
const hrModel = require('../models/hrManagers.js');
const roles = require('../models/roles.js');
const userRoles = require('../models/userRoles.js');
const partners = require("../models/partners.js");
const { getCookies, setCookies } = require("../util/cookiesUtil.js");
const { verifyToken } = require("../util/jwtTokens.js");
const authController = require("../controllers/authController");

const ErrorHandler = require('./errors');
const userPartnerCodes = require("../models/userPartnerCodes.js");

exports.verifyAuthToken = async (req, res, next) => {
	try {
		const cookies = getCookies(req);

		const { jc_at, jc_rt, s_id } = cookies;
		if (!jc_at && !jc_rt && !s_id) {
			return res.status(401).json({ status: false, message: "Unauthorized access.", });
		}

		let refreshTokenDecoded = verifyToken(jc_rt, process.env.REFRESH_TOKEN_SECRET);
		if (refreshTokenDecoded.err) {
			return res.status(401).json({ status: false, message: "Unauthorized access.", });
		}
		req.userId = refreshTokenDecoded?.decodedValue?.userId;
		next();

		// let tokensRefreshed = 0;

		// if (!jc_rt) {
		// 	return res.status(401).json({ status: false, message: "Refresh token absent.", });
		// }

		// let refreshTokenDecoded = verifyToken(jc_rt, process.env.REFRESH_TOKEN_SECRET);

		// if (refreshTokenDecoded.err) {
		// 	return res.status(401).json({ status: false, message: refreshTokenDecoded.err, });
		// }

		// const userId = refreshTokenDecoded?.decodedValue?.userId;

		// if(!userId) {
		// 	return res.status(401).json({ status: false, message: "Invalid Refresh Token.", });
		// }

		// const userAuth = await userAuthTokens.findOne({ where: { refreshToken: jc_rt } });
		// if (!userAuth) {
		// 	return res.status(401).json({ status: false, message: "Invalid Tokens.", });
		// }

		// if (userAuth.dataValues.isRevoked) {
		// 	return res.status(401).json({ status: false, message: "Token access revoked. Please login again.", });
		// }

		// let refreshTokenResponse = "", accessTokenDecoded = "";

		// if (!(jc_at && s_id)) {
		// 	// cookies expired or cleared, generating new tokens and cookies
		// 	refreshTokenResponse = await authController.refreshToken(req, res, refreshTokenDecoded.decodedValue.userId);
		// 	tokensRefreshed = 1;
		// 	if(!refreshTokenResponse.success) {
		// 		return res.status(refreshTokenResponse.statusCode).json({ status: refreshTokenResponse.success, message: refreshTokenResponse.message, });
		// 	}
		// }

		// if(!tokensRefreshed) {
		// 	accessTokenDecoded = verifyToken(jc_at, process.env.ACCESS_TOKEN_SECRET);

		// 	if (accessTokenDecoded.err) {
		// 		if (accessTokenDecoded.err === 'TokenExpiredError') {
		// 			refreshTokenResponse = await authController.refreshToken(req, res, refreshTokenDecoded.decodedValue.userId);
		// 			tokensRefreshed = 1;
		// 			if(!refreshTokenResponse.success) {
		// 				return res.status(refreshTokenResponse.statusCode).json({ status: refreshTokenResponse.success, message: refreshTokenResponse.message, });
		// 			}
		// 		} else {
		// 			return res.status(401).json({ status: false, message: accessTokenDecoded.err, refreshTokens: 0 });
		// 		}
		// 	}
		// }

		// if(!tokensRefreshed) {
		// 	const sessionTokenDecoded = verifyToken(s_id, process.env.SESSION_TOKEN_SECRET);

		// 	if (sessionTokenDecoded.err) {
		// 		if (sessionTokenDecoded.err === 'TokenExpiredError') {
		// 			refreshTokenResponse = await authController.refreshToken(req, res, refreshTokenDecoded.decodedValue.userId);
		// 			tokensRefreshed = 1;
		// 			if(!refreshTokenResponse.success) {
		// 				return res.status(refreshTokenResponse.statusCode).json({ status: refreshTokenResponse.success, message: refreshTokenResponse.message, });
		// 			}
		// 		} else {
		// 			return res.status(401).json({ status: false, message: sessionTokenDecoded.err, refreshTokens: 0 });
		// 		}
		// 	}

		// 	if (sessionTokenDecoded.decodedValue?.userAgent !== req.headers['user-agent'] || sessionTokenDecoded.decodedValue?.userId !== accessTokenDecoded.decodedValue?.userId || accessTokenDecoded.decodedValue?.userId !== refreshTokenDecoded.decodedValue?.userId) {
		// 		console.error("Invalid token:");
		// 		refreshTokenResponse = await authController.refreshToken(req, res, refreshTokenDecoded.decodedValue.userId);
		// 		if(!refreshTokenResponse.success) {
		// 			return res.status(refreshTokenResponse.statusCode).json({ status: refreshTokenResponse.success, message: refreshTokenResponse.message, });
		// 		}
		// 	}
		// }

		// if(tokensRefreshed) {
		// 	accessTokenDecoded = verifyToken(refreshTokenResponse.tokens.accessToken, process.env.ACCESS_TOKEN_SECRET);
		// }

		// req.userId = accessTokenDecoded?.decodedValue?.userId;
		// next();
	} catch (err) {
		console.error(err);
		return res.status(401).json({ status: false, message: "Unauthorized access.", });
	}
};

exports.verifyHR = async (req, res, next) => {
	try {
		const token = req?.headers?.authorization?.split(' ')[1];
		if(!token) {
			return next(ErrorHandler.authError("HR Login is required."));
		}
		const tokenDecoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);
		if(tokenDecoded.err) {
			if (tokenDecoded.err === 'ServerError') {
				console.error("Encountered an error while verifying token: ", tokenDecoded.err);
				return res.status(500).json({status: false, message: "Internal Server Error!"});
			} else {
				console.error("Invalid token: ", tokenDecoded.err);
				return next(ErrorHandler.authError("HR Login is required."));
			}
		}

		const userId = tokenDecoded.decodedValue?.userId;

		if(!userId) {
			console.error("Invalid token: ", tokenDecoded.err);
			return next(ErrorHandler.authError("HR Login is required."));
		}

		const isHR = await hrModel.findOne({
			where: {userId}
		});

		if (!isHR) {
			return next(ErrorHandler.authError("No HR account found."));
		}

		const hrRole = await roles.findOne({
			where: {roleName: "HR"}
		});

		const userRoleExists = await userRoles.findOne({
			where: {userId, roleId: hrRole.roleId,}
		});

		if (!userRoleExists) {
			return next(ErrorHandler.authError("User not assigned HR role."));
		}

		const partnerData = await partners.findOne({
			where: {partnerName: isHR.dataValues.companyName}
		});

		if (!partnerData) {
			return next(ErrorHandler.authError("Invalid partner code."));
		}

		const userPartnerCodeData = await userPartnerCodes.findOne({
			where: {userId, partnerCode: partnerData.partnerCode}
		});

		if (!userPartnerCodeData) {
			return next(ErrorHandler.authError("HR no longer linked with this partner code."));
		}

		req.userId = userId;
		req.companyName = isHR.dataValues.companyName;
		req.companyThumbnail = isHR.dataValues.companyLogo
		req.partnerCode = partnerData.partnerCode;
		req.hrId = isHR.id;
		next();
	} catch (error) {
		console.error("Encountered an error while verifying HR login: ", error);
		return res.status(500).json({status: false, message: "Internal Server Error!"});
	}
};

// const headerCheckMiddleware = (requiredHeader, profileType, isVerified = 1) => {
//     return async (req, res, next) => {
//         const headerValue = req.headers[requiredHeader];
//         if (headerValue) {
//             try {
//                 const decoded = jwt.verify(headerValue.split(' ')[1], process.env.JWT_SECRET);
//                 const userId = decoded.userId;
//                 let verificationInfo;
//                 if (profileType === 'student') {
//                     const studentExists = await students.findOne({ where: { userId } });
//                     if (!studentExists)
//                         return res.status(400).json({ status: false, message: "You are not registered as a student." });
//                     verificationInfo = await users.findOne({
//                         attributes: ['isVerified'],
//                         where: { userId }
//                     });
//                     if (isVerified && verificationInfo.dataValues.isVerified !== '1')
//                         return res.status(400).json({ status: false, message: "You are not verified." });
//                 } else if (profileType === 'hr') {
//                     const hrExists = await hr.findOne({ where: { userId } });
//                     if (!hrExists)
//                         return res.status(400).json({ status: false, message: "You are not registered as HR." });
//                 }
//                 next();
//             } catch (error) {
//                 if (error.name == 'TokenExpiredError' || error.name == 'JsonWebTokenError') {
//                     return res.status(401).json({ status: false, message: "Token expired." });
//                 } else {
//                     return res.status(500).json({ status: false, message: "Internal server error." });
//                 }
//             }
//         } else {
//             return res.status(401).json({ status: false, message: 'Token is required' });
//         }
//     };
// };

// module.exports = { headerCheckMiddleware };
