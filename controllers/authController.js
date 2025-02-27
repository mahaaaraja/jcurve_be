const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Op, where } = require('sequelize');

const authTable = require('../models/authentication');
const users = require('../models/users');
const contactUs = require('../models/contactUs.js');
const students = require('../models/students.js');
const goals = require('../models/goals.js');
const userGoals = require('../models/userGoals.js');
const qualificationsMasters = require('../models/qualificationsMasters.js');
const specializationsMasters = require('../models/specializationsMasters.js');
const verifyMailTokenModel = require('../models/verifyMailTokens.js');
const components = require('../models/components.js');
const userRoles = require('../models/userRoles.js');
const roles = require('../models/roles.js');
const componentSettings = require('../models/componentSettings.js');
const userAuthTokens = require('../models/userAuthTokens.js');
const userPartnerCodes = require('../models/userPartnerCodes.js');

const { generateToken, verifyToken } = require('../util/jwtTokens.js');
const { setCookies, getCookies, unsetCookies } = require('../util/cookiesUtil.js');
const sendMailer = require('../util/nodeMailer');
const smsService = require('../util/sendSMS.js');
const partners = require('../models/partners.js');
const sequelize = require('../util/dbConnection');
const { create } = require('domain');
const { check } = require('express-validator');

const generateUniqueId = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// web app auth apis start
exports.validateEmail = async (req, res, next) => {
  try {
    const email = req.body.email;
    const userExists = await users.findOne({ where: { email } });

    if (userExists) {
      if (userExists.isVerified == true) {
        return res.status(409).json({ message: `User already exists. Please login or use 'Forgot Password' to reset your password.` });
      }
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const token = crypto.createHash('sha256').update(resetToken).digest('hex');

    const checkForRecord = await verifyMailTokenModel.findOne({ where: { email } });

    let proceed = false;
    if (checkForRecord) {
      if (checkForRecord.isVerified) {
        return res.status(400).json({ status: false, message: 'Email already verified. Please signup or login.' });
      }

      var result = await verifyMailTokenModel.update({ token }, { where: { email } });
      proceed = result ? true : false;
    } else {
      var result = await verifyMailTokenModel.create({ email: email, token: token });
      proceed = result ? true : false;
    }

    if (!proceed) {
      console.error('Error occurred while updating mail verification token');
      return res.status(500).json({ message: 'Something went wrong. Please try after sometime.' });
    }

    let mailBody = `
      <html>
      <head></head>
      <body>
          <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
              <img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
              <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                  <p>Dear User,</p>
                  
                  <p>Thank you for signing up for JCurve!.</p>
                  <p>To complete your registration, please verify your email address by clicking the link below:</p>
      
                  <a href="${process.env.WEB_HOST_URL}verified/${token}" target="_blank">${process.env.WEB_HOST_URL}verified/${token}</a>
      
                  <p>If you did not create an account with JCurve, please ignore this email or contact our support team.</p>
      
                  <p>Thank you,</p>
                  <p>The JCurve Team.</p>
              </div>
              <p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
          </div>
      </body>
      </html>`;
    let subject = 'Verify Your Email Address for JCurve';
    await sendMailer.sendMail(email, subject, mailBody);

    return res.status(200).json({ status: true, message: 'Please check your email for verification.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const verifyToken = req.params.token;
    const verifyUser = await verifyMailTokenModel.findOne({ where: { token: req.params.token } });

    if (!verifyToken || !verifyUser) {
      return res.status(404).json({ status: false, message: 'Invalid token.' });
    }
    if (verifyUser.dataValues.isVerified) {
      return res.status(400).json({ status: false, message: 'Verification link expired.' });
    }
    const updateModel = await verifyMailTokenModel.update(
      { isVerified: true },
      { where: { token: req.params.token } },
    );

    if (updateModel) {
      return res.status(200).json({ status: true, message: 'Email verified successfully.', data: verifyUser.dataValues.email });
    }
    res.status(500).json({ status: false, message: 'Something went wrong. Please try after sometime.' });
  } catch (err) {
    console.error(err);
    next(new Error('Server error'));
  }
};

exports.signupWithEmail = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const url = (req.headers.origin || req.headers.referer || '').replace(/\/$/, '');

    const user = await users.findOne({ where: { email: email } });
    // if (user && user.password) {
    //   return res.status(409).json({ message: "User already exists. Please login or use 'Forgot Password' to reset." });
    // }

    const isEmailVerified = await verifyMailTokenModel.findOne({ where: { email: email, isVerified: true } });
    if (!isEmailVerified) {
      return res.status(409).json({ message: 'Email not verified.' });
    }

    const studentRole = await roles.findOne({ where: { roleName: 'Student' } });
    if (!studentRole) {
      return res.status(404).json({ status: false, message: "Role doesn't exist." });
    }

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(password, salt);

    // find a unique identifier
    let uniqueId = null;
    let existingUser = null;
    do {
      uniqueId = generateUniqueId();
      uniqueId = `JC${uniqueId}`;
      existingUser = await users.findOne({ where: { uniqueId } });
    } while (existingUser);

    let secondaryEmail = `${uniqueId}@jcurve.tech`; // JC276398@jcurve.tech

    let partnerCode = null;
    if (url) {
      const partner = await partners.findOne({ where: { portalUrl: url } });
      if (partner) {
        partnerCode = partner.partnerCode;
      }
    }

    var userId;
    if (user) {
      await users.update(
        { password: hash, isVerified: 1, registerStep: 1, isActive: 1, createdAt: new Date() },
        { where: { userId: user.userId } }
      );
      userId = user.userId;
    } else {
      var createUser = await users.create({
        email,
        password: hash,
        isVerified: 1,
        registerStep: 1,
        uniqueId,
        secondaryEmail,
        isActive: 1
      });
      userId = createUser.userId;
    }

    if (userId) {
      await verifyMailTokenModel.update(
        { token: null },
        { where: { email: email } }
      );
      let userRoleCheck = await userRoles.findOne({ where: { userId: userId, roleId: studentRole.dataValues.roleId } });
      if (!userRoleCheck) {
        await userRoles.create({ userId: userId, roleId: studentRole.dataValues.roleId });
      }
      let studentCheck = await students.findOne({ where: { userId: userId } });
      if (studentCheck) {
        await students.update(
          { firstName, lastName },
          { where: { userId: userId } }
        );
      } else {
        await students.create({ userId: userId, firstName, lastName });
      }
      if (partnerCode) {
        let userPartnerCodeCheck = await userPartnerCodes.findOne({ where: { userId: userId, partnerCode } });
        if (!userPartnerCodeCheck) {
          await userPartnerCodes.create({ userId: userId, partnerCode });
        }
      }
    }

    res.status(200).json({ status: true, message: 'Registration Successful!' });

    let mailBody = `
      <html>
          <head></head>
          <body>
              <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
                  <img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
                  <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                      <p>Dear ${firstName},<p>
                      <p>Congratulations! Your registration with JCurve has been successfully completed. We're excited to have you on board.</p>
                      <p>You can now log in and explore all the features we have to offer. If you have any questions or need assistance, feel free to reach out to our support team.</p>
                      <p>Welcome to the JCurve community!</p>

                      <p>Best regards,</p>
                      <p>The JCurve Team.</p>
                  </div>
                  <p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
              </div>
          </body>
      </html>`;

    let sub = 'Welcome to JCurve - Registration Successful!';
    await sendMailer.sendMail(email, sub, mailBody);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: true, message: 'Something went wrong!' });
  }
};

// exports.webLogin = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const checkUser = await users.findOne({ where: { email } });
//     if (!checkUser) {
//       return res.status(404).json({ status: false, message: "Invalid Credentials. Please try again." });
//     }

//     if(!checkUser.dataValues.isActive) {
//       return res.status(403).json({
//         status: false,
//         message: 'User account inactive, can not proceed with login.'
//       })
//     }

//     if (!checkUser.password) {
//       return res.status(404).json({ status: false, message: "Invalid Credentials. Please try again" });
//     }

//     const passwordMatch = await bcrypt.compare(password, checkUser.password);

//     if(!passwordMatch) {
//       return res.status(404).json({ status: false, message: "Invalid Credentials. Please try again" });
//     }

//     const userId = checkUser.userId;

//     const studentDetails = await students.findOne({ where: { userId: checkUser.userId } });
//     if (!studentDetails) {
//       return res.status(404).json({ status: false, message: "Student data not found." });
//     }

//     let userData = {
//       userId,
//       firstName: studentDetails.firstName,
//       lastName: studentDetails.lastName,
//       email: checkUser.email,
//       profilePicture: checkUser.profilePicture ? (process.env.API_HOST_URL + checkUser.profilePicture) : null
//     }

//     const accessToken = await jwtTokens.generateToken({ userId: checkUser.userId }, "30 days");
//     userData['accessToken'] = accessToken;

//     let checkAuthRecord = await userAuthTokens.findOne({ where: { userId } });
//     if (checkAuthRecord) {
//       await userAuthTokens.update({ token: accessToken }, { where: { id: checkAuthRecord.id } });
//     } else {
//       await userAuthTokens.create({ userId, token: accessToken });
//     }

//     const partnerCodeQuery = `
//       SELECT upc.partnerCode FROM user_partner_codes upc WHERE userId = ${userId} ORDER BY createdAt DESC LIMIT 1;
//     `;

//     const queryRes = await sequelize.query(partnerCodeQuery, {
//       type: sequelize.QueryTypes.SELECT
//     });

//     // if partnerCode is truthy, return partnerCode else an empty string
//     const partnerCode = (queryRes.length && (queryRes[0].partnerCode || "")) || "";

//     if (partnerCode) {
//       userData["partnerCode"] = partnerCode;
//     }

//     res.status(200).json({ status: true, message: "You are successfully logged in", data: userData });
//   } catch (err) {
//     console.error(err);
//     next(new Error("Server error"));
//   }
// }

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const hrRole = await roles.findOne({
      where: {
        roleName: 'HR',
      },
    });

    const checkUser = await users.findOne({ where: { email } });
    if (!checkUser) {
      return res
        .status(404)
        .json({ status: false, message: 'User not found.' });
    }

    const isRequestFromHrPortal = req.body.isRequestFromHrPortal ? true : false;
    let webRedirectionUrl = '';
    if (isRequestFromHrPortal) {
      const checkIfHr = await userRoles.findOne({
        where: { userId, roleId: hrRole.dataValues.roleId },
      });
      if (!checkIfHr) {
        return res.status(401).json({
          status: false,
          message: 'Unauthorized Access. Not HR Account.',
        });
      }
      webRedirectionUrl = process.env.HR_WEB_HOST_URL + 'recruiter/';
    } else {
      webRedirectionUrl = process.env.WEB_HOST_URL;
    }

    const studentDetails = await students.findOne({
      where: { userId: checkUser.userId },
    });
    if (!studentDetails) {
      return res
        .status(404)
        .json({ status: false, message: 'Student data not found.' });
    }

    const checkForRecord = await verifyMailTokenModel.findOne({
      where: { email, isVerified: true },
    });

    if (!checkForRecord) {
      return res
        .status(404)
        .json({ status: false, message: 'User not verified.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const token = crypto.createHash('sha256').update(resetToken).digest('hex');

    var result = await verifyMailTokenModel.update(
      { token },
      { where: { email } },
    );
    if (!result) {
      return res.status(500).json({
        status: false,
        message: 'Something went wrong. Please try after sometime.',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Please check your email for reset password.',
    });

    let mailBody = `
      <html>
          <head></head>
          <body>
              <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
                  <img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
                  <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                      <p>Dear ${studentDetails.firstName},</p>
  
                      <p>We received a request to reset your password for your JCurve account. Click the link below to set a new password:</p>
                      <a href="${webRedirectionUrl}forgotPassword/${token}" target="_blank">${webRedirectionUrl}forgotPassword/${token}</a>

                      <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
                      <p>For security reasons, this link will expire in 24 hours.</p>
                      

                      <p>Thank you,</p>
                      <p>The JCurve Team.</p>
                  </div>
                  <p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
              </div>
          </body>
      </html>`;
    let subject = 'Reset Your JCurve Password';
    await sendMailer.sendMail(email, subject, mailBody);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: false,
      message: 'Internal server error. Please try after sometime',
    });
  }
};

exports.verifyForgotPasswordToken = async (req, res, next) => {
  try {
    const findToken = await verifyMailTokenModel.findOne({
      where: { token: req.params.token },
    });
    if (!findToken) {
      return res.status(404).json({ message: 'Invalid token.' });
    }

    const user = await users.findOne({ where: { email: findToken.email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    var data = { userId: user.userId, email: user.email };
    res
      .status(200)
      .json({ message: 'Verified successfully.', data: data });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: true, message: 'Internal server error' });
  }
};

exports.passwordUpdatedEmail = async (req, res, firstName, email) => {
  try {
    res.status(200).json({
      status: true,
      message: 'Your password has been updated successfully.',
    });
    let mailBody = `
      <html>
            <head></head>
            <body>
                <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
                    <img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
                    <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                        <p>Dear ${firstName},<p>
                        <p>We wanted to inform you that your password has been successfully updated. You can now use your new password to log in to your JCurve account.</p>
                        <p>If you did not request this change, please contact our support team immediately to secure your account.</p>

                        <p>Thank you,</p>
                        <p>The JCurve Team.</p>
                    </div>
                    <p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
                </div>
            </body>
        </html>`;
    let sub = 'Your JCurve Password Has Been Updated';

    await sendMailer.sendMail(email, sub, mailBody);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: 'Internal server error. Please try after some time.' });
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { userId, token } = req.params;
    var user = await users.findOne({ where: { userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const studentDetails = await students.findOne({
      where: { userId: user.userId },
    });
    if (!studentDetails) {
      return res.status(404).json({ message: 'Student data not found.' });
    }

    let verifyToken = await verifyMailTokenModel.findOne({
      where: { token, email: user.email },
    });
    if (!verifyToken) {
      return res.status(404).json({ mesasge: 'Invalid token.' });
    }

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);

    let result = await users.update(
      { password: hash },
      { where: { userId } }
    );

    if (!result) {
      return res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }

    await verifyMailTokenModel.update(
      { token: null },
      { where: { email: user.email } }
    );

    this.passwordUpdatedEmail(req, res, studentDetails.firstName, user.email);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: true, message: 'Internal server error' });
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    let findUser = null;
    if (req.userId) {
      findUser = await users.findOne({ where: { userId: req.userId } });
    }

    if (!req.userId || !findUser) {
      return res.status(404).json({ message: 'Invalid user.' });
    }

    let password = findUser.password;
    if (password && !oldPassword) {
      return res.status(404).json({ message: 'Old Password is required.' });
    }
    let isMatch = await bcrypt.compare(oldPassword, password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid old password.' });
    }
    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(newPassword, salt);
    const update = await users.update(
      { password: hash },
      { where: { userId: req.userId } },
    );
    if (!update) {
      return res
        .status(500)
        .json({ message: 'Something went wrong. Please try again.' });
    }
    const studentDetails = await students.findOne({
      where: { userId: req.userId },
    });
    if (!studentDetails) {
      return res.status(404).json({ message: 'Student data not found.' });
    }
    this.passwordUpdatedEmail(
      req,
      res,
      studentDetails.firstName,
      findUser.email,
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: true, message: 'Internal server error' });
  }
};

linkedInAuthCallback = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ status: false, message: 'Authentication Failed.' });
    }
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: process.env.LINKEDIN_REDIRECTURI_SIGNIN_SIGNUP,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
      },
    );

    const linkedinAccessToken = tokenResponse.data.access_token;
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${linkedinAccessToken}`,
      },
    });

    let userWhere = {};
    userWhere.email = profileResponse.data.email;

    const studentRole = await roles.findOne({ where: { roleName: 'Student' } });
    if (!studentRole) {
      return res.status(404).json({ status: false, message: 'Authentication Failed.' });
    }

    const userExists = await users.findOne({ where: userWhere });

    let userData = userExists,
      userPartnerData = null,
      studentData = null,
      userId = null,
      userRoleData = null;
    var fronted_url = process.env.LINKEDIN_REDIRECTURI_FRONTEND;
    var partnerCode = null;
    if (!userData) {
      // making user account if not present
      userWhere.mode = 'linkedin';
      userWhere.isVerified = 1;
      let uniqueId = null;
      let existingUser = null;
      do {
        uniqueId = generateUniqueId();
        uniqueId = `JC${uniqueId}`;
        existingUser = await users.findOne({ where: { uniqueId } });
      } while (existingUser);

      let secondaryEmail = `${uniqueId}@jcurve.tech`;

      userData = await users.create({ ...userWhere, uniqueId, secondaryEmail });

      // downloading ProfilePicture and saving it in our backend
      userId = userData.dataValues.userId;
      const linkedinProfilePictureUrl = profileResponse.data.picture;
      if (linkedinProfilePictureUrl) {
        const fileName = 'profilePic_' + userId + Date.now() + '.jpg';
        const filePath = './resources/profile_pictures/' + fileName;
        const pictureResponse = await axios({
          url: linkedinProfilePictureUrl,
          responseType: 'stream',
        });
        pictureResponse.data
          .pipe(fs.createWriteStream(filePath))
          .on('finish', async () => {
            const relativePath = path.relative('./resources', filePath);
            const profilePicture = '/' + relativePath.replace(/\\/g, '/');
            await users.update(
              { profilePicture },
              { where: { userId } },
            );
          });
      }

      // creating student profile
      const firstName = profileResponse.data.given_name;
      const lastName = profileResponse.data.family_name;
      studentData = await students.create({ userId: userData.dataValues.userId, firstName, lastName });
    }

    const partner = await partners.findOne({ where: { portalUrl: fronted_url } });
    if (partner) {
      partnerCode = partner.partnerCode;
    }

    userId = userData.dataValues.userId;

    if (!studentData) {
      studentData = await students.findOne({
        attributes: ['firstName', 'lastName'],
        where: { userId },
      });
    }

    userPartnerData = await userPartnerCodes.findOne({ where: { userId, partnerCode } });

    if (!userPartnerData) {
      userPartnerData = await userPartnerCodes.create({ userId, partnerCode });
    }

    userRoleData = await userRoles.findOne({
      where: {
        userId,
        roleId: studentRole.dataValues.roleId,
      },
    });

    if (!userRoleData) {
      userRoleData = await userRoles.create({ userId, roleId: studentRole.dataValues.roleId });
    }

    const { sessionToken, accessToken, refreshToken } = generateCookieTokens(
      req,
      res,
      userId,
    );
    await userAuthTokens.create({
      userId,
      accessToken,
      refreshToken,
      sessionToken,
    });

    res.redirect(`${fronted_url}/login?userId=${userId}&accessToken=${accessToken}&email=${userData.dataValues.email}&firstName=${studentData.dataValues.firstName}&lastName=${studentData.dataValues.lastName}&profilePicture=${process.env.API_HOST_URL + userData.dataValues.profilePicture}&partnerCode=${partnerCode}`);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: 'Internal Server Error.' });
  }
};

exports.thirdPartyAuthCallback = async (req, res, next) => {
  try {
    const party = req.params.party;
    if (party === 'linkedin') {
      linkedInAuthCallback(req, res);
    }
  } catch (error) {
    console.error(error);
  }
};

exports.thirdPartyAuth = async (req, res, next) => {
  try {
    const party = req.params.party;
    if (party === 'linkedin') {
      let clientId = process.env.LINKEDIN_CLIENT_ID;
      let redirectUri = process.env.LINKEDIN_REDIRECTURI_SIGNIN_SIGNUP;
      let scope = 'openid profile email';
      let authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
      res.redirect(authUrl);
    } else {
      return res.status(422).json({ status: false, message: 'Invalid third party authentication.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: 'Internal server error' });
  }
};

exports.getComponentSettings = async (req, res, next) => {
  try {
    const userId = req.userId;
    const portalName = req.query.portalName || 'candidate';
    const roleName = req.query.roleName;
    const pageName = req.query.pageName;
    
    let pageNameCondition = {};
    if (pageName) {
      pageNameCondition = { page: pageName };
    }

    let partnerCode = req.query.partnerCode;
    if (!partnerCode) {
      const url = (req.headers.origin || req.headers.referer || '').replace(
        /\/$/,
        '',
      );
      if (url) {
        const partner = await partners.findOne({ where: { portalUrl: url } });
        if (partner) {
          partnerCode = partner.partnerCode;
        } else {
          return res.status(404).json({
            status: false,
            message:
              'Partner not found for the URL, Please provide a valid partnerCode.',
          });
        }
      } else {
        return res.status(500).json({
          status: false,
          message: 'Error fetching URL. Please provide a valid partnerCode.',
        });
      }
    }

    let uniqueComponentNameIds = [];

    if (userId) {
      const userRoleExists = await userRoles.findAll({
        where: { userId },
        include: [
          {
            model: roles,
            attributes: ['roleName'],
          }
        ]
      });

      if (!userRoleExists.length) {
        return res.status(404).json({ status: false, message: "Roles Not Assigned." });
      }

      const roleNames = userRoleExists.map(item => item.role.roleName);
      const lastRole = roleNames[roleNames.length - 1]
      const containsAdminOrSuperAdmin = lastRole == 'Admin' || lastRole == 'Super Admin'
      // roleNames.some(role => role == 'Admin' || role == 'Super Admin');

      if (containsAdminOrSuperAdmin) {
        const componentsData = await components.findAll({
          where: { portalName, partnerCode, ...pageNameCondition },
          attributes: ['page', 'componentNameId'],
        });

        uniqueComponentNameIds = componentsData.map((component) => {
          return {
            pageName: component.page,
            componentNameId: component.componentNameId,
            isVisible: true,
            isEnable: true,
            isMasked: true,
            isMandatory: true,
          };
        });
      } else {
        const roleIds = userRoleExists.map((userRole) => userRole.roleId);
        const roleId = roleIds[roleIds.length - 1];
        const componentSettingsData = await componentSettings.findAll({
          where: {
            roleId,
            partnerCode,
          },
          include: [
            {
              model: components,
              where: { portalName, partnerCode, ...pageNameCondition },
              attributes: ['componentNameId', 'page'],
            },
          ],
        });

        const componentNameIds = componentSettingsData.map((item) => {
          return {
            pageName: item.component.page,
            componentNameId: item.component.componentNameId,
            isVisible: item.isVisible,
            isEnable: item.isEnable,
            isMasked: item.isMasked,
            isMandatory: item.isMandatory,
          };
        });
        uniqueComponentNameIds = componentNameIds;
      }
    } else if ((roleName && roleName == "student") && (pageName == "home" || pageName == "jobs" || pageName == "job-details" || pageName == "explore")) {
      const fetchRole = await roles.findOne({ where: { roleName } });
      if (!fetchRole) {
        return res.status(500).json({ status: false, message: 'Invalid roleName.' });
      }
      const componentSettingsData = await componentSettings.findAll({
        where: {
          roleId: fetchRole.roleId,
          partnerCode,
        },
        include: [
          {
            model: components,
            where: { portalName, partnerCode, ...pageNameCondition },
            attributes: ['componentNameId', 'page'],
          },
        ],
      });

      const componentNameIds = componentSettingsData.map((item) => {
        return {
          pageName: item.component.page,
          componentNameId: item.component.componentNameId,
          isVisible: item.isVisible,
          isEnable: item.isEnable,
          isMasked: item.isMasked,
          isMandatory: item.isMandatory,
        };
      });
      uniqueComponentNameIds = componentNameIds;
    } else {
      return res.status(401).json({ status: false, message: 'Unauthorized access. Please login.' });
    }

    res.status(200).json({ status: true, data: uniqueComponentNameIds });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal server error' });
  }
};

const generateCookieTokens = (req, res, userId) => {
  const sessionToken = generateToken(
    { userAgent: req.headers['user-agent'], userId },
    +process.env.SESSION_TOKEN_EXPIRY,
    process.env.SESSION_TOKEN_SECRET,
  );
  const accessToken = generateToken(
    { userId },
    +process.env.ACCESS_TOKEN_EXPIRY,
    process.env.ACCESS_TOKEN_SECRET,
  );
  const refreshToken = generateToken(
    { userId },
    +process.env.REFRESH_TOKEN_EXPIRY,
    process.env.REFRESH_TOKEN_SECRET,
  ); // the + converts string to number

  cookies = {
    accessToken,
    refreshToken,
    sessionToken,
  };

  setCookies(res, cookies);
  return { sessionToken, accessToken, refreshToken };
};

exports.cookieLogin = async (req, res, next) => {
  try {
    const cookies = getCookies(req);
    const { jc_at, jc_rt, s_id } = cookies;

    if (!jc_rt) {
      return res.status(401).json({
        status: false,
        message: 'No refresh token present.',
        refreshTokens: 0,
      });
    }

    const refreshTokenDecoded = verifyToken(
      jc_rt,
      process.env.REFRESH_TOKEN_SECRET,
    );

    if (refreshTokenDecoded.err) {
      if (refreshTokenDecoded.err === 'TokenExpiredError') {
        await userAuthTokens.update(
          { isRevoked: 1 },
          {
            where: { refreshToken: jc_rt, isRevoked: 0 },
          },
        );
      }
      return res.status(401).json({
        status: false,
        message: refreshTokenDecoded.err,
        refreshTokens: 0,
      });
    }

    if (!(jc_at && s_id)) {
      return res.status(401).json({
        status: false,
        message: 'Tokens not present.',
        refreshTokens: 1,
      });
      // cookies expired or cleared, please generate new tokens and cookies
    }

    const userAuth = await userAuthTokens.findOne({
      where: { accessToken: jc_at, refreshToken: jc_rt, sessionToken: s_id },
    });
    if (!userAuth) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid Tokens.', refreshTokens: 0 });
    }

    if (userAuth.dataValues.isRevoked) {
      return res.status(401).json({
        status: false,
        message: 'Token access revoked. Please login again.',
        refreshTokens: 0,
      });
    }

    const accessTokenDecoded = verifyToken(
      jc_at,
      process.env.ACCESS_TOKEN_SECRET,
    );

    if (accessTokenDecoded.err) {
      if (accessTokenDecoded.err === 'TokenExpiredError') {
        return res.status(401).json({
          status: false,
          message: accessTokenDecoded.err,
          refreshTokens: 1,
        });
      } else {
        return res.status(401).json({
          status: false,
          message: accessTokenDecoded.err,
          refreshTokens: 0,
        });
      }
    }

    const sessionTokenDecoded = verifyToken(
      s_id,
      process.env.SESSION_TOKEN_SECRET,
    );

    if (sessionTokenDecoded.err) {
      if (sessionTokenDecoded.err === 'TokenExpiredError') {
        return res.status(401).json({
          status: false,
          message: sessionTokenDecoded.err,
          refreshTokens: 1,
        });
      } else {
        return res.status(401).json({
          status: false,
          message: sessionTokenDecoded.err,
          refreshTokens: 0,
        });
      }
    }

    if (
      sessionTokenDecoded.decodedValue?.userAgent !==
        req.headers['user-agent'] ||
      sessionTokenDecoded.decodedValue?.userId !==
        accessTokenDecoded.decodedValue?.userId ||
      accessTokenDecoded.decodedValue?.userId !==
        refreshTokenDecoded.decodedValue?.userId
    ) {
      console.error('Invalid token:', err);
      return res
        .status(401)
        .json({ status: false, message: 'Invalid Tokens.', refreshTokens: 0 });
    }

    if (!accessTokenDecoded.decodedValue.userId) {
      return res
        .status(401)
        .json({ status: false, message: 'Invalid Token.', refreshTokens: 0 });
    }

    const userData = await users.findOne({
      where: {
        userId: accessTokenDecoded.decodedValue.userId,
      },
    });

    return res.status(200).json({
      status: true,
      message: 'Login Successful.',
      userData: userData.dataValues,
    });
  } catch (err) {
    console.error('Something went wrong: ', err);
    return res
      .status(500)
      .json({ status: false, message: 'Something went wrong.' });
  }
};

exports.webLogin = async (req, res, next) => {
  try {
    // const { jc_rt } = getCookies(req);
    // if (jc_rt) {
    //   const userAuth = await userAuthTokens.findOne({ where: { refreshToken: jc_rt} });

    //   if (userAuth) {
    //     await userAuthTokens.update({ isRevoked: 1 }, { where: { refreshToken: jc_rt } });
    //   }
    // }

    const { email, password } = req.body;

    if (!(email && password)) {
      return res.status(400).json({ status: 400, message: 'Both email and password are required.' });
    }

    const emailExists = await users.findOne({ where: { email } });
    if (!emailExists) {
      return res.status(404).json({ status: false, message: 'Invalid credentials. Please try again.' });
    }
    if (!emailExists.dataValues.isActive) {
      return res.status(403).json({ status: false, message: 'Account Suspended or Deactivated.' });
    }
    if (!emailExists.dataValues.password) {
      return res.status(403).json({ status: false, message: 'Invalid credentials. Please try again.' });
    }

    const passwordMatch = await bcrypt.compare(password, emailExists.dataValues.password);
    if (!passwordMatch) {
      return res.status(404).json({ status: false, message: 'Invalid credentials. Please try again.' });
    }

    const { sessionToken, accessToken, refreshToken } = generateCookieTokens(req, res, emailExists.dataValues.userId);
    await userAuthTokens.create({ userId: emailExists.dataValues.userId, accessToken, refreshToken, sessionToken });

    delete emailExists.password;

    const partnerData = await userPartnerCodes.findOne({
      where: {
        userId: emailExists.userId
      },
      order: [['createdAt', 'DESC']]
    });

    const studentData = await students.findOne({ where: { userId: emailExists.userId } });

    const userData = {};

    userData.firstName = studentData.firstName;
    userData.lastName = studentData.lastName;
    userData.email = email;
    userData.profilePicture = emailExists.profilePicture ? process.env.API_HOST_URL + emailExists.profilePicture : null;
    userData.partnerCode = partnerData?.partnerCode;
    userData.userId = emailExists.userId;
    userData.jcurveCredits = emailExists.jcurveCredits;
    userData.profileCompletionPercent = emailExists.profileCompletionPercent;

    return res.status(200).json({ status: true, message: "User logged in successfully.", userData });
  } catch (error) {
    console.error('Encountered an error while logging in user.', error);
    res.status(500).json({ status: false, message: 'Something went wrong.' });
  }
};

exports.refreshToken = async (req, res, userId) => {
  try {
    const { jc_rt } = getCookies(req);

    const userAuth = await userAuthTokens.findOne({ where: { refreshToken: jc_rt } });

    if (!userAuth) {
      return { statusCode: 404, success: false, message: 'No such token found.' };
    }

    const { sessionToken, accessToken, refreshToken } = generateCookieTokens(req, res, userId);

    await userAuthTokens.update(
      { isRevoked: 1 },
      {
        where: { refreshToken: jc_rt },
      },
    );

    await userAuthTokens.create({
      sessionToken,
      accessToken,
      refreshToken,
      userId,
    });

    return { statusCode: 200, success: true, message: 'Token refreshed successfully.', tokens: {refreshToken, accessToken, sessionToken} };
  } catch (error) {
    console.error('Encountered an error while refreshing token.', error);
    return { statusCode: 500, success: false, message: 'Something went wrong. Please try again.' };
  }
}

exports.logout = async (req, res, next) => {
  try {
    const cookies = getCookies(req);
    const { jc_at, jc_rt, s_id } = cookies;

    const whereCondition = {};

    if (!jc_rt) {
      return res.status(401).json({ status: false, message: "No refresh token present. User not logged in.", refreshTokens: 0 });
    }

    whereCondition.refreshToken = jc_rt;

    const refreshTokenDecoded = verifyToken(jc_rt, process.env.REFRESH_TOKEN_SECRET);

    if (refreshTokenDecoded.err) {
      if (refreshTokenDecoded.err === 'TokenExpiredError') {
        await userAuthTokens.update({ isRevoked: 1 }, {
          where: { refreshToken: jc_rt, isRevoked: 0 }
        });
        return res.status(401).json({ status: false, message: "Refresh token expired, user already logged out.", refreshTokens: 0 });
      } else if(refreshTokenDecoded.err === 'JsonWebTokenError') {
        console.log("Invalid tokens: ", refreshTokenDecoded.err);
        return res.status(401).json({status: false, message: "Invalid tokens!"});
      } else {
        console.log("Something went wrong while decoding refresh token: ", refreshTokenDecoded.err);
        return res.status(500).json({status: false, message: "Something went wrong!"});
      }
    }

    if(jc_at) {
      const accessTokenDecoded = verifyToken(jc_at, process.env.ACCESS_TOKEN_SECRET);

      if (accessTokenDecoded.err && accessTokenDecoded.err === 'JsonWebTokenError') {
        console.log("Invalid Access Token: ", accessTokenDecoded.err);
        return res.status(401).json({status: false, message: "Invalid Tokens."});
      }
      if (accessTokenDecoded.err && accessTokenDecoded.err === 'ServerError') {
        console.log("Something went wrong while decoding access token: ", accessTokenDecoded.err);
        return res.status(500).json({ status: false, message: "Something went wrong!" });
      }

      whereCondition.accessToken = jc_at;
    }

    if (s_id) {
      const sessionTokenDecoded = verifyToken(jc_at, process.env.ACCESS_TOKEN_SECRET);

      if (sessionTokenDecoded.err && sessionTokenDecoded.err === 'JsonWebTokenError') {
        console.log("Invalid Access Token: ", sessionTokenDecoded.err);
        return res.status(401).json({ status: false, message: "Invalid Tokens." });
      }
      if (sessionTokenDecoded.err && sessionTokenDecoded.err === 'ServerError') {
        console.log("Something went wrong while decoding access token: ", sessionTokenDecoded.err);
        return res.status(500).json({ status: false, message: "Something went wrong!" });
      }

      whereCondition.sessionToken = s_id;
    }

    const userAuth = await userAuthTokens.findOne({ where: whereCondition });
    if (!userAuth) {
      return res.status(401).json({ status: false, message: "Invalid Tokens.", refreshTokens: 0 });
    }

    if (userAuth.dataValues.isRevoked) {
      return res.status(401).json({ status: false, message: "Token access revoked. User already logged out.", refreshTokens: 0 });
    }

    unsetCookies(res, ['jc_at', 'jc_rt', 's_id']);

    await userAuthTokens.update({ isRevoked: 1 }, {
      where: whereCondition
    });

    return res.status(200).json({status: true, message: "User logged out successfully."});

  } catch (error) {
    console.error("Error while logging out user: ", error);
    return res.status(500).json({status: false, message: "Something went wrong!"});
  }
}
