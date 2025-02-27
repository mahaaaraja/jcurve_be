/*
primary key has been made the base for every operation, like you need to provide corresponding primary key for updating and deleting 
*/

const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const slugify = require('slugify');
const path = require('path');
const fs = require('fs');
const { sourceMapsEnabled } = require("process");
const { Op, where, Sequelize } = require('sequelize');

const courses = require("../models/courses");
const skills = require("../models/skills");
const goals = require("../models/goals");
const { quizQuestions, courseQuiz } = require('../models/quiz');
const users = require('../models/users');
const userRoles = require('../models/userRoles.js');
const roles = require('../models/roles.js');
const components = require('../models/components.js');
const componentSettings = require('../models/componentSettings.js');
const payments = require('../models/payments.js');

const jwtTokens = require('../util/jwtTokens.js');
const sequelize = require('../util/dbConnection');
const { networkInterfaces } = require('os');
const { raw } = require('body-parser');
const moment = require("moment");
const sendMailer = require('../util/nodeMailer');
const recruiterRegistrations = require('../models/recruiterRegistrations.js');
const partners = require('../models/partners.js');
const userAuthTokens = require('../models/userAuthTokens.js');


// Recruiter Onboarding
exports.getAllRecruiters = async (req, res, next) => {
  try {
      const recruiters = await recruiterRegistrations.findAll();

      const updatedRecruiters = recruiters.map(recruiter => {
          if (recruiter.organizationLogo) {
              recruiter.organizationLogo = process.env.API_HOST_URL + recruiter.organizationLogo;
          }
          return recruiter;
      });

      res.status(200).json({ status: true, data: updatedRecruiters });
  } catch (error) {
      console.error("Error in retrieving recruiter data:", error);
      return res.status(500).json({ status: false, message: "Failed to fetch recruiters." });
  }
};

exports.getRecruiterById = async (req, res, next) => {
  try {
      const { recruiterId } = req.params;

      const recruiter = await recruiterRegistrations.findOne({ where: { recruiterId } });
      if (!recruiter) {
          return res.status(404).json({ status: false, message: "Recruiter not found." });
      }

      if (recruiter.organizationLogo) {
          recruiter.organizationLogo = process.env.API_HOST_URL + recruiter.organizationLogo
      }

      res.status(200).json({ status: true, data: recruiter });
  } catch (error) {
      console.error("Error in retrieving specific recruiter:", error);
      return res.status(500).json({ status: false, message: "Failed to fetch recruiter." });
  }
};

const sendOnboardingEmails = async (recruiterEmail, supportEmail, recruiterName, recruiterMobileNumber, organizationName, industry) => {
  let recruiterMail = {
      subject: "Welcome to JCurve - Revolutionising Your Hiring Process",
      mailBody: `<html>
          <head></head>
          <body>
              <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
                  <img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
                  <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                      
                      <p>Dear ${recruiterName},</p>
                      <p>Thank you for choosing JCurve as your hiring partner. We're excited to help you transform your recruitment process and connect with exceptional talent.</p>
                      <br>

                      <h2>Why JCurve?</h2>
                      <p><b>1. Skill-Verified Candidates:</b> Access a pool of candidates with validated skills, matching your exact requirements.</p>
                      <p><b>2. Industry-Standard Job Templates:</b> Create precise job descriptions using our curated templates, ensuring you attract the right talent.</p>
                      <p><b>3. AI-Powered Matching:</b> Our advanced algorithms connect you with candidates who not only match your requirements but align with your company culture.</p>
                      <p><b>4. Real-Time Skill Tracking:</b> Monitor candidate progress as they upskill to meet your needs.</p>
                      <p><b>5. Streamlined Hiring Process:</b> Reduce time-to-hire and improve quality of hires with our efficient, data-driven approach.</p>
                      <br>

                      <h2>How We're Different:</h2>
                      <p><b>- Focus on Skills, Not Just Resumes:</b> We verify candidate skills through rigorous assessments.</p>
                      <p><b>- Continuous Talent Development:</b> Candidates on our platform are constantly upskilling, ensuring you always have access to cutting-edge talent.</p>
                      <p><b>- Bias-Free Hiring:</b> Our skill-first approach promotes diversity and ensures you're hiring based on merit.</p>
                      <p><b>- Cost-Effective:</b> Reduce recruitment costs and minimise hiring mistakes.</p>
                      <br>

                      <h2>Get Started:</h2>
                      <p>1. Log in to your dashboard at <a href="jcurve.tech">jcurve.tech</a></p>
                      <p>2. Create your first job posting using our intuitive templates</p>
                      <p>3. Start receiving matched, skill-verified candidates</p>
                      <br>

                      <p>We're here to support you every step of the way. If you have any questions, our team is ready to assist at <a href="mailto:support@jcurve.tech">support@jcurve.tech</a>.</p>
                      <p>Ready to revolutionise your hiring process?</p>
                      <p>To learn more about how JCurve is transforming recruitment, visit our website: [<a href="${process.env.HR_WEB_HOST_URL}">Learn More About JCurve</a>]</p>
                      <p>Welcome to the future of hiring!</p>
                      <br>

                      <p>Best regards,</p>
                      <p>JCurve Team.</p>
                  </div>
                  <p><small>© ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
              </div>
          </body>
          </html>`
  };

  let supportMail = {
      subject: "New Employer Registration Alert!",
      mailBody: `<html>
          <head></head>
          <body>
              <div style="text-align: center; background-color: rgb(237,242,247); padding: 15px 30px">
                  <img src="${process.env.API_HOST_URL}logo.png" alt="JCurve">
                  <div style="text-align: left; background-color: #fff; padding: 15px 30px; margin-top: 20px;">
                      
                      <p>Attention Team,</p>
                      <p>We are pleased to announce that we have successfully registered a new employer on the JCurve platform.</p>
                      <br>

                      <h3>Employer Details:</h3>
                      <ul>
                          <li>Employer Name: ${recruiterName}</li>
                          <li>Company: ${organizationName}</li>
                          <li>Industry: ${industry}</li>
                          <li>Registration Date: ${moment().format('LL')}</li>
                      </ul>
                      <br>

                      <p>This new registration presents an opportunity for us to showcase the value of our platform and build a strong relationship with our newest employer. Please ensure that we provide them with a warm welcome and any necessary support as they navigate our features.</p>
                      <br>

                      <h3>Action Items:</h3>
                      <ul></ul>
                          <li>Follow-Up: Make sure to reach out to the employer to introduce yourself and offer assistance with their onboarding process.</li>
                          <li>Resources: Share helpful resources or guides to help them get started effectively.</li>
                          <li>Feedback: Encourage them to provide feedback on their experience so we can continually improve our services.</li>
                      </ul>
                      <br>

                      <p>Let’s work together to ensure they have a positive experience from the outset. Your efforts are vital in making a lasting impression!</p>
                      <p>Thank you for your attention and continued dedication.</p>
                      <br>

                      <p>Best regards,</p>
                      <p>JCurve Team.</p>
                  </div>
                  <p><small>© ${new Date().getFullYear()} JCurve. All rights reserved.</small></p>
              </div>
          </body>
          </html>`
  };

  try {
    await sendMailer.sendMail(recruiterEmail, recruiterMail.subject, recruiterMail.mailBody);
    console.log("Recruiter Mail Sent");
    await sendMailer.sendMail(supportEmail, supportMail.subject, supportMail.mailBody);
    console.log("Support Mail Sent");
  } catch (err) {
    console.error(err);
  }
}

exports.setRecruiterOnboarding = async (req, res, next) => {
  try {
      let { officialEmail, firstName, lastName, countryCode, mobileNumber, organizationName, organizationDescription, organizationCity, industry, employeesCount, isIndependentEmployer, userId } = req.body;
      
      const deleteFileFunc = () => {
          if (req.files && req.files.organizationLogo) {
              const filePath = req.files.organizationLogo[0].path
              fs.unlink(filePath, function (err) {
                  if (err) return console.error(err);
              });
          }
      }

      if (!officialEmail || !/^\S+@\S+\.\S+$/.test(officialEmail)) {
          deleteFileFunc()
          return res.status(422).json({ status: false, message: "Please provide a valid officialEmail." });
      }

      if (mobileNumber && !/^\d{10,15}$/.test(mobileNumber)) {
          deleteFileFunc()
          return res.status(422).json({ status: false, message: "Please provide a valid mobile number." });
      }

      // employeesCount = Number(employeesCount);
      // if (isNaN(employeesCount) || employeesCount < 0) {
      //   deleteFileFunc()
      //   return res.status(422).json({ status: false, message: "Employees count must be a positive integer." });
      // }

      const recruiterExist = await recruiterRegistrations.findOne({  where: { officialEmail } });
      if (recruiterExist) {
          deleteFileFunc()
          return res.status(404).json({ status: false, message: "recruiter already exists" });
      }

      let insertData = {
          officialEmail, 
          firstName, 
          lastName, 
          countryCode,
          mobileNumber, 
          organizationName, 
          organizationDescription, 
          organizationCity, 
          industry, 
          employeesCount,
          isIndependentEmployer,
          // userId // TODO
      };

      if (req.files && req.files.organizationLogo) {
          const fullPath = req.files.organizationLogo[0].path;
          const relativePath = path.relative('resources', fullPath);
          const organizationLogoPath = '/' + relativePath.replace(/\\/g, '/');
          insertData.organizationLogo = organizationLogoPath
      }

      await recruiterRegistrations.create(insertData);

      res.status(200).json({ status: true, message: "Recruiter onboarding completed successfully." });
      await sendOnboardingEmails(officialEmail, "support@jcurve.tech", `${firstName} ${lastName}`, mobileNumber, organizationName, industry);
  } catch (error) {
      console.error("Error in setRecruiterOnboarding:", error);
      return res.status(500).json({ status: false, message: "Failed to complete recruiter onboarding." });
  }
};

exports.updateRecruiterById = async (req, res, next) => {
  try {
      let { recruiterId, officialEmail, firstName, lastName, countryCode, mobileNumber, organizationName, organizationDescription, organizationCity, industry, employeesCount, isIndependentEmployer } = req.body;

      const deleteFileFunc = () => {
          if (req.files && req.files.organizationLogo) {
              const filePath = req.files.organizationLogo[0].path;
              fs.unlink(filePath, function (err) {
                  if (err) return console.error(err);
              });
          }
      };

      if (officialEmail && !/^\S+@\S+\.\S+$/.test(officialEmail)) {
          deleteFileFunc();
          return res.status(422).json({ status: false, message: "Please provide a valid official email." });
      }

      if (mobileNumber && !/^\d{10,15}$/.test(mobileNumber)) {
          deleteFileFunc();
          return res.status(422).json({ status: false, message: "Please provide a valid mobile number." });
      }

      // if (employeesCount != undefined) {
      //   employeesCount = Number(employeesCount);
      //   if (isNaN(employeesCount) || employeesCount < 0) {
      //     deleteFileFunc()
      //     return res.status(422).json({ status: false, message: "Employees count must be a positive integer." });
      //   }
      // }

      const existingRecruiter = await recruiterRegistrations.findOne({ where: { recruiterId } });

      if (!existingRecruiter) {
          deleteFileFunc();
          return res.status(404).json({ status: false, message: "Recruiter not found." });
      }

      if (officialEmail) {
          const recruiterExist = await recruiterRegistrations.findOne({ where: { officialEmail, recruiterId: { [Op.ne]: recruiterId } } });
          if (recruiterExist) {
              deleteFileFunc();
              return res.status(404).json({ status: false, message: "Recruiter with this email already exists." });
          }
      }

      let recruiterData = {
          officialEmail,
          firstName,
          lastName,
          countryCode,
          mobileNumber,
          organizationName,
          organizationDescription,
          organizationCity,
          industry,
          employeesCount,
          isIndependentEmployer,
      };

      if (req.files && req.files.organizationLogo) {
          if (existingRecruiter.organizationLogo) {
              const oldLogoPath = path.join('resources', existingRecruiter.organizationLogo);
              fs.unlink(oldLogoPath, function (err) {
                  if (err) console.error("Error deleting old logo:", err);
              });
          }

          const fullPath = req.files.organizationLogo[0].path;
          const relativePath = path.relative('resources', fullPath);
          recruiterData.organizationLogo = '/' + relativePath.replace(/\\/g, '/');
      }

      if (Object.keys(recruiterData).length == 0) {
          return res.status(400).json({ status: false, message: "Please provide new values to update." });
      }

      await recruiterRegistrations.update(recruiterData, { where: { recruiterId } });

      return res.status(200).json({ status: true, message: "Recruiter updated successfully." });

  } catch (error) {
    console.error('Error updating recruiter:', error);
    res.status(500).json({ status: false, message: 'Internal server error.' });
  }
};

exports.deleteRecruiterById = async (req, res, next) => {
  try {
      const { recruiterId } = req.params;
      
      const existingRecruiter = await recruiterRegistrations.findOne({ where: { recruiterId } })

      if (!existingRecruiter) {
          return res.status(404).json({ status: false, message: "Recruiter not found." });
      }

      if (existingRecruiter.organizationLogo) {
          const prevFilePath = "resources" + existingRecruiter.organizationLogo;
          fs.unlink(prevFilePath, function (err) {
            if (err) return console.error(err);
          });
      }

      const deletedRows = await recruiterRegistrations.destroy({ where: { recruiterId } });

      res.status(200).json({ status: true, message: "Recruiter deleted successfully." });
  } catch (error) {
      console.error("Error in deleteRecruiterById:", error);
      return res.status(500).json({ status: false, message: "Failed to delete recruiter." });
  }
};


// Component Settings
exports.createComponentSettings = async (req, res, next) => {
  try {
    const { componentsJsonData } = req.body;

    let createdComponents = [];
    for (const component of componentsJsonData) {
      let { componentName, componentNameId, page, portalName = "candidate", partnerCode } = component;

      if (!partnerCode) {
        const url = (req.headers.origin || req.headers.referer || '').replace(/\/$/, '');
        if (url) {
          const partner = await partners.findOne({ where: { portalUrl: url } });
          if (partner) {
            partnerCode = partner.partnerCode;
          } else {
            throw new Error('Partner not found for the URL, please provide a valid partnerCode.');
          }
        } else {
          throw new Error('Error fetching URL. Please provide a valid partnerCode.');
        }
      }

      const existingComponent = await components.findOne({
        where: {
          portalName: portalName,
          page: page,
          componentNameId: componentNameId,
          partnerCode: partnerCode,
        }
      });

      if (!existingComponent) {
        if (!componentName) {
          componentName = componentNameId.replace(/-/g, " ");
        }

        createdComponents.push({
          page: page,
          componentNameId: componentNameId,
          componentName: componentName,
          portalName: portalName,
          partnerCode: partnerCode,
        });
      }
    }

    if (createdComponents.length > 0) {
      await components.bulkCreate(createdComponents);
      return res.status(200).json({ message: 'Components created successfully.' });
    } else {
      return res.status(400).json({ message: 'No new components to create.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: err.message });
  }
};

exports.getComponentSettings = async (req, res, next) => {
  try {
    const portalName = req.query.portalName || 'candidate';

    let partnerCode = req.query.partnerCode;
    let pageName = req.query.pageName;

    let whereCondition = {}
    if (partnerCode) {
      whereCondition.partnerCode = partnerCode
    }
    
    if (pageName) {
      whereCondition = { page: pageName };
    }

    const componentsData = await components.findAll({
        where: { ...whereCondition, portalName },
        attributes: ['componentId', 'componentNameId', 'page', 'componentName', 'partnerCode'],
        // group: ['componentId']
    });
    
    res.status(200).json({ status: true, data: componentsData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};


// Role And Component Settings
exports.getRoles = async (req, res, next) => {
  try {
    const rolesData = await roles.findAll({
        attributes: ['roleId', 'roleName'],
    });

    res.status(200).json({
      status: true,
      data: rolesData 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

exports.getRoleAndComponentSettings = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const pageName = req.query.pageName;
    
    let pageNameCondition = {};
    if (pageName) {
      pageNameCondition.page = pageName;
    }
    let partnerCode = req.query.partnerCode;
    let partnerCodeCondition = {}
    if (partnerCode) {
      partnerCodeCondition.partnerCode = partnerCode
    }

    const portalName = req.query.portalName || 'candidate'

    const findRole = await roles.findOne({
      where: {
        roleId 
      }, 
      attributes: ['roleId', 'roleName'] 
    });

    if(!findRole) {
      return res.status(404).json({ status: false, message: 'Role not found' });
    }

    let getRoles = findRole.toJSON();
    let finalComponentData = [];

    if (findRole.roleName == 'Admin' || findRole.roleName == 'Super Admin') {
      const componentsData = await components.findAll({
        where: {
          portalName,
          ...partnerCodeCondition,
          ...pageNameCondition
        },
        attributes: ['componentId', 'page', 'componentNameId', 'partnerCode'],
      });

      finalComponentData = componentsData.map(component => ({ componentId: component.componentId, pageName: component.page, componentNameId: component.componentNameId, partnerCode: component.partnerCode, isVisible: true, isEnable: true, isMasked: true, isMandatory: true }));
    } else {
      const componentSettingsData = await componentSettings.findAll({
        where: {
          roleId: roleId,
          ...partnerCodeCondition,
        },
        attributes: ['componentId', 'isVisible', 'isEnable', 'isMasked', 'isMandatory'],
      });
          

      const componentsData = await components.findAll({
        where: { portalName, ...partnerCodeCondition, ...pageNameCondition },
        attributes: ['componentId', 'componentNameId', 'page', 'partnerCode'],
      })
        

      const updatedcomponentsData = componentsData.map(component => {
        const componentData = {
          componentId: component.componentId,
          pageName: component.page,
          componentNameId: component.componentNameId,
          partnerCode: component.partnerCode,
          isVisible: false, 
          isEnable: false, 
          isMasked: false, 
          isMandatory: false
        }

        let isComponentSettingsExist = componentSettingsData.find(componentsetting => componentsetting.componentId == component.componentId)
        if (isComponentSettingsExist) {
          componentData.isVisible = isComponentSettingsExist.isVisible
          componentData.isEnable = isComponentSettingsExist.isEnable
          componentData.isMasked = isComponentSettingsExist.isMasked
          componentData.isMandatory = isComponentSettingsExist.isMandatory
        }

        return componentData
      })

      finalComponentData = updatedcomponentsData;
    }

    getRoles.components = finalComponentData;

    res.status(200).json({ status: true, data: getRoles })
  } catch (err)  {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

exports.insertRole = async (req, res, next) => {
  try {
      const { roleName } = req.body;
      
      const existingRole = await roles.findOne({
          where: { roleName },
      });
      if (existingRole) {
          return res.status(409).json({ status: false, message: "Role already exists" });
      }

      const newRole = await roles.create({ roleName });
      return res.status(201).json({ status: true, message: "Role created successfully." });
      
  } catch (err) {
      console.error("Error creating role:", err);
      return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

exports.updateRole = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { roleId, roleName, componentsJsonData } = req.body;
    const portalName = req.query.portalName || 'candidate';

    let partnerCode = req.query.partnerCode;
    if (!partnerCode) {
      const url = (req.headers.origin || req.headers.referer || '').replace(/\/$/, '');
      if (url) {
        const partner = await partners.findOne({ where: { portalUrl: url } });
        if (partner) {
          partnerCode = partner.partnerCode;
        } else {
          await t.rollback();
          return res.status(404).json({ status: false, message: 'Partner not found for the URL, Please provide a valid partnerCode.' });
        }
      } else {
        await t.rollback();
        return res.status(404).json({ status: false, message: 'Error fetching URL. Please provide a valid partnerCode.'});
      }
    }
    
    if (!componentsJsonData || componentsJsonData.length == 0) {
      await t.rollback();
      return res.status(400).json({ status: false, message: "Please pass at least one component to proceed." });
    }

    const findRole = await roles.findOne({ where: { roleId }, transaction: t });
    if (!findRole) {
      await t.rollback();
      return res.status(404).json({ status: false, message: "Role not found." });
    }

    if (roleName) {
      const existingRole = await roles.findOne({
        where: { roleId: { [Op.ne]: roleId }, roleName },
        transaction: t
      });

      if (existingRole) {
        await t.rollback();
        return res.status(409).json({ status: false, message: "Role already exists" });
      }

      const result = await roles.update(
        { roleName },
        { where: { roleId }, transaction: t }
      );

      if (!result) {
        await t.rollback();
        return res.status(500).json({ status: false, message: "Something went wrong. Please try after some time." });
      }
    }

    const existingComponentsData = await components.findAll({
      where: { partnerCode, portalName },
      attributes: ['componentId', 'componentNameId'],
      transaction: t
    });
    const existingComponentIds = existingComponentsData.map(component => component.componentId);
    
    const existingRoleComponentsData = await componentSettings.findAll({
      where: { roleId, partnerCode },
      attributes: ['componentId', 'isVisible', 'isEnable', 'isMasked', 'isMandatory'],
      transaction: t
    });
    const existingRoleComponentIds = existingRoleComponentsData.map(componentSetting => componentSetting.componentId);

    const updatePromises = [];
    let nonExistingIds = [];

    for (const componentsData of componentsJsonData) {
      const { componentId, isVisible, isEnable, isMasked, isMandatory } = componentsData;
      
      if (!existingComponentIds.includes(componentId)) {
        nonExistingIds.push(componentId);
      } else {

        const isRoleComponentIdExist = existingRoleComponentIds.includes(componentId);
        if (isVisible || isEnable || isMasked || isMandatory) {
          if (isRoleComponentIdExist) {
            const componentSettingData = existingRoleComponentsData.find(componentSetting => componentSetting.componentId == componentId);
            
            if (componentSettingData.isVisible != isVisible || componentSettingData.isEnable != isEnable || componentSettingData.isMasked != isMasked || componentSettingData.isMandatory != isMandatory) {
              updatePromises.push(
                componentSettings.update(
                  { isVisible, isEnable, isMasked, isMandatory },
                  { where: { componentId, roleId, partnerCode }, transaction: t }
                )
              );
            }
          } else {
            updatePromises.push(
              componentSettings.create(
                { componentId, roleId, partnerCode, isVisible, isEnable, isMasked, isMandatory },
                { transaction: t }
              )
            );
          }
        } else if (isRoleComponentIdExist) {
          updatePromises.push(
            componentSettings.destroy(
              { where: { componentId, roleId, partnerCode }, transaction: t }
            )
          );
        }
      }
    }
    if (nonExistingIds.length > 0) {
      await t.rollback();
      return res.status(404).json({ status: false, message: `ComponentId(s) with ID(s) ${nonExistingIds.join(', ')} not found.` });
    }

    await Promise.all(updatePromises);
    await t.commit();

    return res.status(200).json({ status: true, message: "Updated successfully." });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

exports.deleteRole = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { roleId } = req.params;

    const findRole = await roles.findOne({
      where: {
        roleId
      }
    });
    if (!findRole) {
        return res.status(404).json({ status: false, message: "Role not found." });
    }

    const userRoleAssignment = await userRoles.findOne({
      where: {
        roleId
      }
    });
    if (userRoleAssignment) {
        return res.status(409).json({ status: false, message: "Role is assigned to users. Can't delete." });
    }

    await componentSettings.destroy({ where: { roleId }, transaction: t });
    await roles.destroy({ where: { roleId }, transaction: t });

    await t.commit();
    return res.status(200).json({ status: true, message: "Role deleted successfully." });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

// User And Roles
exports.getUsers = async (req, res, next) => {
  try {
    const getUsers = await users.findAll({ attributes: ['userId', 'userName', 'email', 'countryCode', 'phoneNumber'] });
    res.status(200).json({ status: true, data: getUsers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

exports.getUserDataAndRoles = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const getUser = await users.findOne({ where: { userId }, attributes: ['userId', 'userName', 'email', 'countryCode', 'phoneNumber'] });
    if (!getUser) {
      return res.status(404).json({ status: false, message: "User Not found." });
    }

    const userRolesDetails = await userRoles.findAll({
      where: { userId, },
      attributes: ['userRoleId', 'roleId'],
      include: [
        {
          model: roles,
          attributes: ['roleName']
        }
      ]
    });

    const formattedUserRolesDetails = userRolesDetails.map(userRole => ({
      userRoleId: userRole.userRoleId,
      roleId: userRole.roleId,
      roleName: userRole.role.roleName
    }));

    let usersData = getUser.toJSON();
    usersData['userRolesDetails'] = formattedUserRolesDetails;

    res.status(200).json({ status: true, data: usersData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

exports.createUserRole = async (req, res, next) => {
  try {
    const { roleId, userId } = req.body;

    const existingUser = await users.findOne({ where: { userId } });
    if (!existingUser) {
      return res.status(409).json({status: false, message: "User Not Found"});
    }

    const existingRole = await roles.findOne({ where: { roleId } });
    if (!existingRole) {
      return res.status(409).json({status: false, message: "Role not found."});
    }

    const existingUserRole = await userRoles.findOne({ where: { roleId, userId } });
    if (existingUserRole) {
      return res.status(409).json({status: false, message: "User role already exists."});
    }

    await userRoles.create({ userId, roleId });

    return res.status(200).json({ status: true, message: "User role assignment successful." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

exports.deleteUserRole = async (req, res, next) => {
  try {
    const { userId, roleId} = req.params;

    const existingUser = await users.findOne({ where: { userId } });
    if (!existingUser) {
      return res.status(409).json({status: false, message: "User Not Found"});
    }

    const existingRole = await roles.findOne({ where: { roleId } });
    if (!existingRole) {
      return res.status(409).json({status: false, message: "Role not found."});
    }

    const existingUserRole = await userRoles.findOne({ where: { roleId, userId } });
    if (!existingUserRole) {
      return res.status(409).json({ status: false, message: "Role not assigned to user." });
    }

    await userRoles.destroy({ where: { roleId, userId } });
    return res.status(200).json({ status: true, message: "User role deleted successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, message: "Internal Server Error." });
  }
};

// User And isActive
exports.updateUserIsActive = async (req, res, next) => {
  try {
    const { userId, isActive } = req.body;

    const userExist = await users.findOne({ where: { userId } });
    if (!userExist) {
      return res.status(400).json({ status: false, message: "User Not Found." })
    }

    await users.update({ isActive }, { where: { userId } })
    return res.status(200).json({ status: true, message: "User Active Status Updated Successfully" })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ status: false, message: "Internal Server Error." })
  }
}

// ------------------------------------------ Old Controllers --------------------------------------------- //


exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const checkUser = await users.findOne({ where: { email } });
    if (!checkUser) {
      return res.status(404).json({ message: "Invalid Credentials. Please try again." });
    }

    const passwordMatch = await bcrypt.compare(password, checkUser.password);

    if(!passwordMatch) {
      return res.status(404).json({ message: "Invalid Credentials. Please try again" });
    }

    const userRole = await userRoles.findAll({ where: { userId: checkUser.userId } });
    if (!userRole.length) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    var componentsSettings = null;
    let userRoleNames = []
    for (let i = 0; i < userRole.length; i++) {
      let checkRole = await roles.findOne({ where: { roleId: userRole[i].roleId } });
      if (!checkRole) {
        return res.status(401).json({ message: "Unauthorized access." });
      }

      userRoleNames.push(checkRole.roleName)
      // let allowedRoleNames = ["Super Admin", "Admin", "HR"];
      // if (!allowedRoleNames.includes(checkRole.roleName)) {
      //   return res.status(401).json({ message: "Unauthorized access." });
      // }

      // if (checkRole.roleName == "Super Admin" || checkRole.roleName == "Admin") {
      //   let componentsQuery = `select json_arrayagg(componentNameId) as array from components`;
      //   const components = await sequelize.query(componentsQuery, { type: sequelize.QueryTypes.SELECT });
      //   componentsVisibilitySettings.push(components[0].array);
      // }

    }

    let allowedRoleNames = ["Super Admin", "Admin", "HR"];
    
    let hasAllowedRole = userRoleNames.some(role => allowedRoleNames.includes(role));
    if (!hasAllowedRole) {
      return res.status(401).json({ message: "Unauthorized access." });
    }

    let componentsQuery = `select json_arrayagg(componentNameId) as array from components`;
    const components = await sequelize.query(componentsQuery, { type: sequelize.QueryTypes.SELECT });
    componentsSettings = components[0].array;

    let userData = {
      userId: checkUser.userId,
      email: checkUser.email,
      profilePicture: checkUser.profilePicture,
      componentsSettings
    }

    const accessToken = await jwtTokens.generateToken({ userId: checkUser.userId }, "30 days");
    userData['accessToken'] = accessToken;
    let checkAuthRecord = await userAuthTokens.findOne({ where: { userId: checkUser.userId } });
    if (checkAuthRecord) {
      await userAuthTokens.update({ token: accessToken }, { where: { id: checkAuthRecord.id } });
    } else {
      await userAuthTokens.create({ userId: checkUser.userId, token: accessToken });
    }

    res.status(200).json({ message: "You are successfully logged in", data: userData });
  } catch (err) {
    console.error(err);
    next(new Error("Server error"));
  }
}
