const users = require('../models/users.js');
const authTable = require('../models/authentication.js');
const studentController = require('./studentController.js');
const jwtTokens = require('../util/jwtTokens.js');
const cookiesUtil = require('../util/cookiesUtil.js')
const contactUs = require('../models/contactUs.js')
const partners = require('../models/partners.js');
const splashScreens = require('../models/splashScreens.js');
const qualificationsMasters = require('../models/qualificationsMasters.js');
const specializationsMasters = require('../models/specializationsMasters.js');
const companiesMasters = require('../models/companiesMasters.js');
const collegesMasters = require('../models/collegesMasters.js');
const systemNotification = require('../models/systemNotification.js');
const waitingListUsers = require('../models/waitingListUsers.js');

const sendMailer = require('../util/nodeMailer');

const { Op } = require('sequelize');
const bcrypt = require('bcrypt');

exports.contactUs = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNo, roleId, message } = req.body;

    // Create a new enquiry in the ContactUs table
    const enquiry = await contactUs.create({
      firstName,
      lastName,
      email,
      phoneNo,
      roleId,
      message,
    });

    // Send a success response
    res.status(201).json({ status: true, enquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSplashScreens = async (req, res, next) => {
  try {
    const { partnerCode } = req.query;
    const where = partnerCode ? { partnerCode } : { partnerCode: null };
    
    const data = await splashScreens.findAll({ where: where });
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Unable to fetch splash screens." });
  }
}

exports.getQualifications = async (req, res, next) => {
  try {
    const data = await qualificationsMasters.findAll({ where: { isActive: true } });
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Unable to fetch qualifications." });
  }
}

exports.getSpecializations = async (req, res, next) => {
  try {
    const { qualificationId } = req.query;
    const where = qualificationId ? { qualificationId } : { };
    const data = await specializationsMasters.findAll({ where: where });
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Unable to fetch specializations." });
  }
}

exports.getCompaniesList = async (req, res, next) => {
  try {
    const data = await companiesMasters.findAll({ where: { isActive: true } });
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Unable to fetch companies list." });
  }
}

exports.getCollegesList = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const where = keyword ? { collegeName: { [Op.or]: [{ [Op.like]: `${keyword}%` }, { [Op.eq]: 'Others' }] }, isActive: true } : { isActive: true };
    const data = await collegesMasters.findAll({ where: where });
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Unable to fetch colleges list." });
  }
}

exports.getSystemNotifications = async (req, res, next) => {
  try {
    const currentDateTime = new Date().toISOString();
    const notifications = await systemNotification.findAll({
      attributes: ['title', 'message'],
      where: {
        startTime: {
          [Op.lte]: currentDateTime
        },
        endTime: {
          [Op.gte]: currentDateTime
        }
      }
    });
    res.status(200).json({
      status: true,
      notifications,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Something went wrong!'
    });
  }
};

exports.joinWaitingList = async (req, res, next) => {
  try {
    const { fullName, email } = req.body;
    let check = await waitingListUsers.findOne({ where: { email } });
    if (check) {
      return res.status(200).json({ success: true, message: "You have already joined the waiting list." });
    } else {
      await waitingListUsers.create({ fullName, email });
      let mailBody = `
      <html>
      <head></head>
      <body>
          <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
              <img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
              <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                  <p>Hi ${fullName},</p>
                  
                  <p>Thank you for signing up for the <b>JCurve Beta</b> waitlist! 🚀</p>
                  <p>You’re now on the waitlist, and we’ll keep you updated as we move forward with the Beta launch.</p>
      
                  <p>Stay tuned!</p>
      
                  <p>Regards,</p>
                  <p>Team JCurve.</p>
              </div>
              <p><small>&copy; ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
          </div>
      </body>
      </html>`;
      let subject = 'JCurve Beta Waitlist Confirmation';
      sendMailer.sendMail(email, subject, mailBody);
      return res.status(200).json({
        success: true,
        message: "Thank you for signing up! 🎉 \n Your spot on the waitlist is confirmed. \n Please check your email inbox for the confirmation."
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.waitingListUserCount = async (req, res, next) => {
  try {
    let count = await waitingListUsers.count({});
    return res.status(200).json({
      success: true,
      waitingListUserCount: count + 73
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
