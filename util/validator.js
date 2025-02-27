const { check, validationResult, param, body } = require("express-validator");

const partnerCodeValidation = () => {
  return [
    check('partnerCode').notEmpty().withMessage('Partner Code is required').trim().escape(),
  ];
};

const validateEmail = () => {
  return [
    check('email').notEmpty().withMessage('Required').isEmail().withMessage('Please enter valid email').trim().escape().normalizeEmail({ gmail_remove_dots: false, gmail_convert_googlemaildotcom: false }),
    // check('token').notEmpty()
  ]
}

const token = () => {
  return [
    check('token').notEmpty().trim().escape()
  ]
}

const userSignup = () => {
  return [
    check('firstName', 'First Name is required').notEmpty().trim().escape(),
    check('lastName', 'Last Name is required').notEmpty().trim().escape(),
    check('email').notEmpty().withMessage('Required').isEmail().withMessage('Please enter valid email').trim().escape().normalizeEmail({ gmail_remove_dots: false, gmail_convert_googlemaildotcom: false }),
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter').matches(/\d/).withMessage('Password must contain at least one number').matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, or #)').trim().escape(),
  ]
}

const modeValidation = () => {
  return [
    body('mode').isIn(['email', 'mobile']).withMessage('Invalid mode of login.'),
  ];
};

const validateRegistrationForStudent = () => {
  return [
    body('registerStep')
      .notEmpty().withMessage("registerStep is required.")
      .isIn([1, 2, 3, 4]).withMessage("registerStep should be in range of 1-4.")
      .custom((value, { req }) => {
        if (req.body.hasOwnProperty('registerStep')) {
          let messages = [];
          const { registerStep } = req.body;
          if (parseInt(registerStep) === 1) {
            if (!req.body.fullName) {
              messages.push('Full name is required');
            }
            if (!['female', 'male', 'other'].includes(req.body.gender)) {
              messages.push('Invalid gender');
            }
            if (!req.body.workExperience) {
              messages.push('Work experience is required');
            }
            if (!req.body.careerGap) {
              messages.push('Career gap is required');
            }
          } else if (parseInt(registerStep) === 2) {
            if (!req.body.qualificationId) {
              messages.push('Degree is required');
            }
            if (!req.body.specializationId) {
              messages.push('Study field is required');
            }
          } else if (parseInt(registerStep) === 3) {
            if (!req.body.employmentType) {
              messages.push('Employment type is required');
            }
          } else if (parseInt(registerStep) === 4) {
            if (!req.body.goalId) {
              messages.push('Goal ID is required');
            }
          } else {
            messages.push('Invalid registerStep value');
          }
          if (messages.length > 0) {
            throw new Error(messages.join(' & '));
          }
        }
        return true;
      }),
  ];
};

const webLogin = () => {
  return [
    check('email').notEmpty().withMessage('Required').isEmail().withMessage('Please enter valid email').trim().escape().normalizeEmail({ gmail_remove_dots: false, gmail_convert_googlemaildotcom: false }),
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter').matches(/\d/).withMessage('Password must contain at least one number').matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, or #)').trim().escape(),
  ]
}

const validateProfileDates = () => {
  return [
    body('education.startDate').optional().custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid date format for start date');
      }
      return true;
    }),

    body('education.endDate').optional().custom((value, { req }) => {
      const startDate = req.body.education.startDate;
      if (value && !isValidDate(value)) {
        throw new Error('Invalid date format for end date');
      }
      if (startDate && value && new Date(startDate) >= new Date(value)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

    body('certificate.issueDate').optional().custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid date format for issue date');
      }
      return true;
    }),

    body('experience.startDate').optional().custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid date format for start date in experience');
      }
      return true;
    }),

    body('experience.endDate').optional().custom((value, { req }) => {
      const startDate = req.body.experience.startDate;
      if (value && !isValidDate(value)) {
        throw new Error('Invalid date format for end date in experience');
      }
      if (startDate && value && new Date(startDate) >= new Date(value)) {
        throw new Error('End date must be after start date in experience');
      }
      return true;
    }),

    body('publication.publicationDate').optional().custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid date format for publication date');
      }
      return true;
    })
  ];
};

function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}

const validatingEnumsInProfile = () => {
  return [
    // we should not have '' empty string here Have to discuss with abraar
    check('pronouns').optional({ nullable: true }).isIn(['He/Him', 'She/Her', 'They/Them', '', 'Other']).withMessage("Pronouns are not as specified"),
    check('ethnicDiversity').optional({ nullable: true }).isIn(['Caucasian', 'African American', '', 'Asian', 'Hispanic', 'Other']).withMessage("ethnicDiversity is not as specified"),
    check('disabilityInclusion').optional({ nullable: true }).isIn(['Yes', 'No', '',]).withMessage("disabilityInclusion is not as specified."),
    check('neurodiversity').optional({ nullable: true }).isIn(['Yes', 'No', '']).withMessage("neurodiversity is not as specified."),
    check('veteranStatus').optional({ nullable: true }).isIn(['Veteran', 'Non-Veteran', '']).withMessage("veteranStatus is not as specified."),
    check('gender').optional({ nullable: true }).isIn(['Male', 'Female', 'Prefer Not To Disclose.', '']).withMessage("gender is not as specified."),
  ]
};

const validateExportOptions = () => {
  return [
    check('exportOptions').notEmpty().withMessage('Export options are required').isObject().withMessage('Export options must be an object'),
    check('exportOptions.*').isBoolean().withMessage('All export option values must be boolean')
  ];
}
const insertProfile = () => {
  return [
    check("profileType")
      .notEmpty()
      .withMessage("profileType is required")
      .trim()
      .escape(),
  ];
};

const validateEnquiry = () => {
  return [
    check('firstName').notEmpty().withMessage('First name is required'),
    check('lastName').notEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Invalid email address'),
    check('phoneNo').isMobilePhone().withMessage('Invalid phone number'),
    check('role').isIn(['student', 'hr', 'college']).withMessage('Invalid role'),
    check('message').notEmpty().withMessage('Message is required'),
  ]
};

const validateContactInformation = () => {
  return [
    check('firstName').notEmpty().withMessage('First name is required').trim().escape(),
    check('lastName').notEmpty().withMessage('Last name is required').trim().escape(),
    check('email').isEmail().withMessage('Invalid email address'),
    check('countryCode').notEmpty().withMessage('countryCode is required').trim().escape(),
    check('phoneNumber').isMobilePhone().withMessage('Invalid phone number').trim().escape(),
    check('dateOfBirth').optional({ nullable: true }).isISO8601().withMessage('Date of Birth must be a valid date in ISO format- YYYY-MM-DD'),
    check('gender').optional({ nullable: true }).isIn(['Male', 'Female', 'Others']).withMessage("gender type should be either Male, Female or Others."),
    // check('addressLine1').notEmpty().withMessage('Address Line 1 is required'),
    // check('addressLine2').notEmpty().withMessage('Address Line 2 is required'),
    check('city').notEmpty().withMessage('city is required').trim().escape(),
    check('postalCode').notEmpty().withMessage('postalCode is required').trim().escape(),
    check('country').notEmpty().withMessage('country is required').trim().escape(),
    check('state').notEmpty().withMessage('state is required').trim().escape(),
    // check('linkedInUrl').optional({ nullable: true }).isURL().withMessage('Please provide a valid URL for the LinkedIn URL').trim().escape(),
  ]
};

const validateWorkHistory = () => {
  return [
    check('jobTitle').notEmpty().withMessage('Job title is required'),
    check('companyId').notEmpty().withMessage('Company ID is required').isInt({ gt: 0 }).withMessage("Company ID should be a positive integer").trim().escape(),
    check('otherCompanyName').optional().trim().escape(),
    check('employmentType').notEmpty().withMessage('Employment type is required'),
    check('location').notEmpty().withMessage('Location is required'),
    check('isCurrent').isBoolean().withMessage('isCurrent must be a boolean value'),
    check('startDate').isISO8601().withMessage('Start date must be a valid date in ISO format- YYYY-MM-DD'),
    check('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date in ISO format- YYYY-MM-DD')
  ];
};

const validateUpdateWorkHistory = () => {
  return [
    check('experienceId').notEmpty().withMessage('Experience ID is required').isInt({ gt: 0 }).withMessage("Experience ID should be a positive integer").trim().escape(),
    check('jobTitle').optional().notEmpty().withMessage('Job title is required if provided'),
    check('companyId').optional().isInt({ gt: 0 }).withMessage("Company ID should be a positive integer").trim().escape(),
    check('otherCompanyName').optional().trim().escape(),
    check('employmentType').optional().notEmpty().withMessage('Employment type is required if provided'),
    check('location').optional().notEmpty().withMessage('Location is required if provided'),
    check('isCurrent').optional().isBoolean().withMessage('isCurrent must be a boolean value if provided'),
    check('startDate').optional().isISO8601().withMessage('Start date must be a valid date in ISO format - YYYY-MM-DD if provided'),
    check('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date in ISO format - YYYY-MM-DD if provided')
  ];
};

const validateEducation = () => {
  return [
    check('collegeId').notEmpty().withMessage('College ID is required').isInt({ gt: 0 }).withMessage("College ID should be a positive integer").trim().escape(),
    check('qualificationId').notEmpty().withMessage('Qualification ID is required').isInt({ gt: 0 }).withMessage("Qualification ID should be a positive integer").trim().escape(),
    check('specializationId').notEmpty().withMessage('Specialization ID is required').isInt({ gt: 0 }).withMessage("Specialization ID should be a positive integer").trim().escape(),
    check('isCurrent').isBoolean().withMessage('isCurrent must be a boolean value'),
    check('startDate').isISO8601().withMessage('Start date must be a valid date in ISO format- YYYY-MM-DD'),
    check('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date in ISO format- YYYY-MM-DD')
  ];
};

const validateUpdateEducation = () => {
  return [
    check('educationId').notEmpty().withMessage('Education ID is required').isInt({ gt: 0 }).withMessage("Education ID should be a positive integer").trim().escape(),
    check('collegeId').optional().isInt({ gt: 0 }).withMessage("College ID should be a positive integer").trim().escape(),
    check('qualificationId').optional().isInt({ gt: 0 }).withMessage("Qualification ID should be a positive integer").trim().escape(),
    check('specializationId').optional().isInt({ gt: 0 }).withMessage("Specialization ID should be a positive integer").trim().escape(),
    check('isCurrent').optional().isBoolean().withMessage('isCurrent must be a boolean value if provided'),
    check('startDate').optional().isISO8601().withMessage('Start date must be a valid date in ISO format - YYYY-MM-DD if provided'),
    check('endDate').optional({ nullable: true }).isISO8601().withMessage('End date must be a valid date in ISO format - YYYY-MM-DD if provided')
  ];
};

const validateUserSkillsList = () => {
  return [
    check('userSkillsList').isArray().withMessage('Skill list must be an array'),
    check('userSkillsList.*.skillId')
      .isInt({ gt: 0 }).withMessage('Skill ID must be a positive integer'),
    check('userSkillsList.*.isSelect')
      .isBoolean().withMessage('isSelect must be a boolean value')
  ];
};

const validateSkillsToUpdate = () => {
  return [
    check('skillsToUpdate').isArray().withMessage('Skills to update must be an array'),
    check('skillsToUpdate.*.skillId')
      .isInt({ gt: 0 }).withMessage('User skill ID must be a positive integer'),
    check('skillsToUpdate.*.resumeSkillLevel')
      .isInt({ min: 1, max: 10 }).withMessage('Acquired level must be a number between 1 and 10')
  ];
};

const validateAcquiredLevel = () => {
  return [
    check('acquiredLevel').notEmpty().withMessage("acquiredLevel is required").isInt({ min: 1, max: 10 }).withMessage('Acquired level must be a number between 1 and 10')
  ];
};

const validateresumeSkillLevel = () => {
  return [
    check('resumeSkillLevel').notEmpty().withMessage("resumeSkillLevel is required").isInt({ min: 1, max: 10 }).withMessage('Acquired level must be a number between 1 and 10')
  ];
};

const validateParams = () => {
  return [
    check('type')
      .notEmpty().withMessage('Type parameter is required')
      .isIn(['company', 'goal']).withMessage('Type parameter must be either company or goal'),
  ];
};

const validateGoalId = () => {
  return [
    check("goalId").notEmpty().withMessage("goalId is required").isInt({ gt: 0 }).withMessage("Goal ID should be a positive integer").trim().escape(),
  ];
};

const validateOrderId = () => {
  return [
    check("orderId").notEmpty().withMessage("orderId is required").isInt({ gt: 0 }).withMessage("order ID should be a positive integer").trim().escape(),
  ];
};


const validateCurriculumId = () => {
  return [
    check("curriculumId").notEmpty().withMessage("curriculumId is required").isInt({ gt: 0 }).withMessage("Curriculum ID should be a positive integer").trim().escape(),
  ];
};

const validateUserCourseId = () => {
  return [
    check("userCourseId").notEmpty().withMessage("userCourseId is required").isInt({ gt: 0 }).withMessage("userCourseId should be a positive integer").trim().escape(),
  ];
};

const validateStudentId = () => {
  return [
    check("studentId").notEmpty().withMessage("studentId is required").isInt({ gt: 0 }).withMessage("studentId should be a positive integer").trim().escape(),
  ];
};

const validateExperienceId = () => {
  return [
    check("experienceId").notEmpty().withMessage("experienceId is required").isInt({ gt: 0 }).withMessage("experienceId should be a positive integer").trim().escape(),
  ];
};

const validateEducationId = () => {
  return [
    check("educationId").notEmpty().withMessage("educationId is required").isInt({ gt: 0 }).withMessage("educationId should be a positive integer").trim().escape(),
  ];
};

const validateStudentPreference = () => {
  return [
    check("currentSalary").optional().isFloat({ gt: 0 }).withMessage("Current salary should be a positive number").trim().escape(),
    check("expectedSalary").optional().isFloat({ gt: 0 }).withMessage("Expected salary should be a positive number").trim().escape(),
    check("isRelocate").optional().isBoolean().withMessage("isRelocate must be a boolean value"),
    check("locations").optional().isArray().withMessage("Locations should be an array").custom((value) => {
      if (value.some((item) => typeof item != 'string')) {
        throw new Error("Each location should be a string");
      }
      return true;
    })

  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  // var extractedErrors = "";
  // errors.array().map((err, i, row) => {
  //   extractedErrors += err.msg + (i + 1 < row.length ? " & " : "");
  // });

  return res.status(422).json({ status: false, message: errors.errors[0].msg });
};

const hrSignup = () => {
  return [
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter').matches(/\d/).withMessage('Password must contain at least one number').matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, or #)').trim().escape(),
    check("partnerCode").notEmpty().withMessage("Partner Code is required").trim().escape(),
    check("email").notEmpty().withMessage("Email is required").trim().escape().normalizeEmail({ gmail_remove_dots: false, gmail_convert_googlemaildotcom: false })
  ]
};

const validateComponentSettingsJsonData = () => {
  return [
    check('componentsJsonData').isArray().withMessage('Components JSON Data must be an array'),
    check('componentsJsonData.*.page').isString().withMessage('Page must be a string').notEmpty().withMessage('Page must not be empty'),
    check('componentsJsonData.*.topMenu').optional().isString().withMessage('Top Menu must be a string').notEmpty().withMessage('Top Menu must not be empty'),
    check('componentsJsonData.*.componentName').optional().isString().withMessage('Component Name must be a string').notEmpty().withMessage('Component Name must not be empty'),
    check('componentsJsonData.*.componentNameId').isString().withMessage('Component Name ID must be a string').notEmpty().withMessage('Component Name ID must not be empty'),
    check('componentsJsonData.*.portalName').optional().isString().withMessage('Portal Name must be a string')
  ];
};

const validateUpdateRoleData = () => {
  return [
    check("roleId").notEmpty().withMessage("roleId is required").isInt({ gt: 0 }).withMessage("role ID should be a positive integer").trim().escape(),
    check('roleName').optional().isString().withMessage('Role Name must be a string').notEmpty().withMessage('Role Name must not be empty'),
    check('componentsJsonData').notEmpty().withMessage('componentsJsonData is required').isArray().withMessage('Components JSON Data must be an array'),
    check('componentsJsonData.*.componentId').notEmpty().withMessage('componentId is required').isInt({ gt: 0 }).withMessage('Component ID must be a positive integer'),
    check('componentsJsonData.*.isVisible').notEmpty().withMessage('isVisible is required').isBoolean().withMessage('isVisible must be a boolean'),
    check('componentsJsonData.*.isEnable').notEmpty().withMessage('isEnable is required').isBoolean().withMessage('isEnable must be a boolean'),
    check('componentsJsonData.*.isMasked').notEmpty().withMessage('isMasked is required').isBoolean().withMessage('isMasked must be a boolean'),
    check('componentsJsonData.*.isMandatory').notEmpty().withMessage('isMandatory is required').isBoolean().withMessage('isMandatory must be a boolean')
  ];
};

const roleId = () => {
  return [
    check("roleId").notEmpty().withMessage("roleId is required").isInt({ gt: 0 }).withMessage("role ID should be a positive integer").trim().escape(),

  ]
}

const roleName = () => {
  return [
    check('roleName').isString().withMessage('Role Name must be a string').notEmpty().withMessage('Role Name must not be empty'),
  ]
}

const validateIsActive = () => {
  return [
    check('isActive').isBoolean().withMessage('isActive must be a boolean value'),
  ];
};

const userId = () => {
  return [
    check("userId").notEmpty().withMessage("userId is required").isInt({ gt: 0 }).withMessage("user ID should be a positive integer").trim().escape(),

  ]
}

const questionId = () => {
  return [
    check("questionId").notEmpty().withMessage("Question Id is required").isInt({ gt: 0 }).withMessage("Question Id should be a positive integer").trim().escape(),
  ]
}

const validateSkillQuestionId = () => {
  return [
    check("skillQuestionId").notEmpty().withMessage("skillQuestionId is required").isInt({ gt: 0 }).withMessage("skillQuestionId should be a positive integer").trim().escape(),
  ]
}

const isApproved = () => {
  return [
    check('isApproved').notEmpty().withMessage("isApproved is required").isBoolean().withMessage('isApproved must be a boolean value'),
  ];
}

const commentId = () => {
  return [
    check("commentId").notEmpty().withMessage("Comment Id is required").isInt({ gt: 0 }).withMessage("Comment Id should be a positive integer").trim().escape(),
  ]
}

const jobId = () => {
  return [
    check("jobId").notEmpty().withMessage("jobId is required").isInt({ gt: 0 }).withMessage("job ID should be a positive integer").trim().escape(),

  ]
}

const jobStatusId = () => {
  return [
    check("jobStatusId").notEmpty().withMessage("Job Status ID is required").isInt({ gt: 0 }).withMessage("Job Status ID should be a positive integer").trim().escape(),

  ]
}

const updateRolesComponentIds = () => {
  return [
    check('roleName').isString().withMessage('Role Name must be a string').notEmpty().withMessage('Role Name must not be empty'),
    check('visibleComponentIds').isArray().withMessage('Visible Component IDs must be an array'),
    check('visibleComponentIds.*').isInt({ gt: 0 }).withMessage('Each visible component ID must be a positive integer')
  ];
};

const hrlogin = () => {
  return [
    check("email").notEmpty().withMessage("Email is required").trim().escape().normalizeEmail({ gmail_remove_dots: false, gmail_convert_googlemaildotcom: false }),
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter').matches(/\d/).withMessage('Password must contain at least one number').matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, or #)').trim().escape(),
  ];
};

const updateQuizRemainingTime = () => {
  return [
    check("quizId").notEmpty().withMessage("quizId is required").isInt({ gt: 0 }).withMessage("Quiz ID should be a positive integer").trim().escape(),
    check("remainingTime").notEmpty().withMessage("remainingTime is required").trim().escape(),
  ];
};

const updateQuizStatus = () => {
  return [
    check("quizId").notEmpty().withMessage("quizId is required").trim().escape(),
    check('questionId').notEmpty().isInt({ gt: 0 }).withMessage('Should be a positive integer').trim().escape(),
    check('underReview').optional().isIn([0, 1]).withMessage("underReview should be either 0 or 1"),
    check('isSkipped').optional().isIn([0, 1]).withMessage("isSkipped should be either 0 or 1"),
    check('userAnswer').optional().trim().isIn(['a', 'b', 'c', 'd', '']).withMessage('userAnswer must be one of: a, b, c, d, or empty string'),
    check('isSubmitted').optional().isIn([0, 1]).withMessage("isSubmitted should be either 0 or 1"),
  ]
}

const courseCertificates = () => {
  return [
    check('certificateName').optional().trim().escape(),
    check('issueDate').optional({ nullable: true }).isISO8601().withMessage('issue date must be a valid date in ISO format- YYYY-MM-DD'),
    check("issuedBy").optional().notEmpty().withMessage("issuedBy is required").trim().escape(),
  ]
}

const updateCourseProgress = () => {
  return [
    check("courseId").notEmpty().withMessage("courseId is required").trim().escape(),
    check("isCourseCompleted").notEmpty().withMessage("isCourseCompleted is required").trim().escape(),
  ];
};

const updateCourseWatchTime = () => {
  return [
    check("courseId").notEmpty().withMessage("courseId is required").trim().escape(),
    check("watchTimeInSec").notEmpty().withMessage("watchTimeInSec is required").trim().escape(),
  ];
};

const validateCourseId = () => {
  return [
    check("courseId").notEmpty().withMessage("courseId is required").isInt({ gt: 0 }).withMessage("Course ID should be a positive integer").trim().escape(),
  ];
};

const validateSkillId = () => {
  return [
    check("skillId").notEmpty().withMessage("Skill is required").isInt({ gt: 0 }).withMessage("Skill ID should be a positive integer").trim().escape(),
  ];
};

const validateLevel = () => {
  return [
    check('level').notEmpty().withMessage('level is required').isInt({ min: 1, max: 5 }).withMessage("Level must be a number between 1 and 5").trim().escape(),
  ];
};

const updatePasswordRules = () => {
  return [
    check('userId', 'userId is required').notEmpty().isInt({ gt: 0 }).withMessage('Should be a positive integer').trim().escape(),
    check('token', 'token is required').notEmpty().trim().escape(),
    check('password').notEmpty().withMessage('Password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter').matches(/\d/).withMessage('Password must contain at least one number').matches(/[@$!%*?&#]/).withMessage('Password must contain at least one special character (@, $, !, %, *, ?, &, or #)').trim().escape(),
  ]
}

const changePasswordRules = () => {
  return [
    check('oldPassword').optional().isLength({ min: 8 }).withMessage('Old Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('Old Password must contain at least one uppercase letter').matches(/\d/).withMessage('Old Password must contain at least one number').matches(/[@$!%*?&#]/).withMessage('Old Password must contain at least one special character (@, $, !, %, *, ?, &, or #)').trim().escape(),
    check('newPassword').notEmpty().withMessage('New Password is required').isLength({ min: 8 }).withMessage('New Password must be at least 8 characters long').matches(/[A-Z]/).withMessage('New Password must contain at least one uppercase letter').matches(/\d/).withMessage('New Password must contain at least one number').matches(/[@$!%*?&#]/).withMessage('New Password must contain at least one special character (@, $, !, %, *, ?, &, or #)').trim().escape(),
  ]
}

const amount = () => {
  return [
    check("amount").notEmpty().withMessage("Amount is required").isFloat({ gt: 0 }).withMessage("Amount should be greater than 0").trim().escape(),
  ];
};

const buyCourse = () => {
  return [
    check("materialId").notEmpty().withMessage("Material ID is required").isInt({ gt: 0 }).withMessage("Material ID should be a positive integer").trim().escape(),
  ];
};

const buyAssessment = () => {
  return [
    check("jobAssessmentId").notEmpty().withMessage("Job Assessment ID is required").isInt({ gt: 0 }).withMessage("Job Assessment ID should be a positive integer").trim().escape(),
  ];
};

const addAssessmentToCart = () => {
  return [
    check('jobId').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Job ID should be a positive integer").trim().escape(),
    check('goalId').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Goal ID should be a positive integer").trim().escape(),
    check('categoryId').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Category ID should be a positive integer").trim().escape(),
    check('subCategoryId').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Sub Category ID should be a positive integer").trim().escape(),
    check('skillId').optional({ nullable: true }).isInt({ gt: 0 }).withMessage("Skill ID should be a positive integer").trim().escape(),
  ];
}; 

const validateRemoveFromCart = () => {
  return [
    check('itemId').notEmpty().withMessage('Item ID is required').isInt({ gt: 0 }).withMessage('Item ID should be a positive integer').trim().escape(),
    check('itemType').notEmpty().withMessage('Item Type is required').isIn(['Course', 'Assessment']).withMessage('Item Type must be either Course or Assessment').trim().escape(),
  ];
};

const validateRoadmapType = () => {
  return [
    check('assessmentType').optional().isIn(['preRoadmap', 'postRoadmap']).withMessage("assessmentType should be either preRoadmap or postRoadmap").trim().escape(),
  ];
};

const validateEmploymentType = () => {
  return [
    check('employmentType').optional().isIn(['Full Time', 'Part Time', 'Contract', 'Internship']).withMessage("Employment type should be either Full-Time, Part-Time, Contract, or Internship").trim().escape(),
  ];
};

const recruiterId = () => {
  return [
    check("recruiterId").notEmpty().withMessage("recruiterId is required").isInt({ gt: 0 }).withMessage("recruiter ID should be a positive integer").trim().escape(),

  ]
}

const validateRecruiterData = () => {
  return [
    check('officialEmail').optional().isEmail().withMessage('Please provide a valid email').trim().escape(),
    check('firstName').optional().notEmpty().withMessage('First name is required if provided').trim().escape(),
    check('lastName').optional().notEmpty().withMessage('Last name is required if provided').trim().escape(),
    check('mobileNumber').optional().isMobilePhone().withMessage('Please provide a valid mobile number').trim().escape(),
    check('organizationName').optional().notEmpty().withMessage('Organization name is required if provided').trim().escape(),
    check('organizationDescription').optional().trim().escape(),
    check('organizationCity').optional().notEmpty().withMessage('City is required if provided').trim().escape(),
    check('industry').optional().notEmpty().withMessage('Industry is required if provided').trim().escape(),
    check('employeesCount').optional().isInt({ min: 0 }).withMessage('Employees count must be a positive integer').trim().escape(),
    check('organizationLogo').optional().isURL().withMessage('Please provide a valid URL for the organization logo').trim().escape(),
  ];
};

const joinWaitingList = () => {
  return [
    check('email').notEmpty().isEmail().withMessage('Please enter valid email').trim().escape().normalizeEmail({ gmail_remove_dots: false, gmail_convert_googlemaildotcom: false }),
    check('fullName').notEmpty().withMessage('Full name is required').trim().escape(),
  ]
}

const rechargeWallet = () => {
  return [
    check('amount')
      .notEmpty().withMessage('Amount is required').
      isBase64().withMessage('Please pass amount in base64 format')
      .custom((value) => {
        const decodedStr = atob(value);
        if (!/^\d+$/.test(decodedStr) || decodedStr <= 0) {
          return false;
        }
        return true;
      }).withMessage("Amount should be a valid positive integer")
      .trim().escape()
  ]
};

const validateUserAssessmentId = () => {
  return [
    check("userAssessmentId").notEmpty().withMessage("User Assessment Id is required").isInt({ gt: 0 }).withMessage("User Assessment Id should be a positive integer").trim().escape(),
  ]
}

const validateUserAnswers = () => {
  return [
    check('userAnswers').isArray().withMessage('User Answers to update must be an array'),
    check('userAnswers.*.questionId')
      .isInt({ gt: 0 }).withMessage('User question ID must be a positive integer'),
    check('userAnswers.*.answer')
      .notEmpty().withMessage('User answer is required').trim().escape(),
  ];
};

const validateRemainingTime = () => {
  return [
    check("remainingTime").notEmpty().withMessage("Remaining Time is required").isInt({ gt: -1 }).withMessage("Remaining Time should be 0 or a positive integer").trim().escape()
  ]
}

const updateAssessmentRemainingTime = () => {
  return [
    check("userAssessmentId").notEmpty().withMessage("User Assessment Id is required").isInt({ gt: 0 }).withMessage("User Assessment Id should be a positive integer").trim().escape(),
    check("remainingTime").notEmpty().withMessage("Remaining Time is required").isInt({ gt: -1 }).withMessage("Remaining Time should be a positive integer").trim().escape()
  ]
}

module.exports = {
  joinWaitingList,
  validateRegistrationForStudent,
  validate,
  insertProfile,
  validateEnquiry,
  validateGoalId,
  modeValidation,
  validatingEnumsInProfile,
  validateProfileDates,
  hrSignup,
  hrlogin,
  updateQuizRemainingTime,
  updateCourseProgress,
  updateCourseWatchTime,
  validateParams,
  validateCourseId,
  updateQuizStatus,
  validateSkillId,
  validateLevel,
  validateCurriculumId,
  validateContactInformation,
  validateWorkHistory,
  validateUpdateWorkHistory,
  validateEducation,
  validateUpdateEducation,
  partnerCodeValidation,
  validateUserSkillsList,
  validateSkillsToUpdate,
  validateAcquiredLevel,
  validateUserCourseId,
  validateExperienceId,
  validateStudentId,
  userSignup,
  validateEmail,
  token,
  webLogin,
  validateEducationId,
  updatePasswordRules,
  changePasswordRules,
  roleId,
  userId,
  jobId,
  jobStatusId,
  updateRolesComponentIds,
  validateComponentSettingsJsonData,
  validateUpdateRoleData,
  roleName,
  validateIsActive,
  amount,
  buyCourse,
  buyAssessment,
  courseCertificates,
  validateRemoveFromCart,
  addAssessmentToCart,
  validateRoadmapType,
  validateEmploymentType,
  recruiterId,
  validateRecruiterData,
  validateStudentPreference,
  validateresumeSkillLevel,
  commentId,
  validateExportOptions,
  questionId,
  isApproved,
  validateSkillQuestionId,
  rechargeWallet,
  validateOrderId,
  validateUserAssessmentId,
  updateAssessmentRemainingTime,
  validateRemainingTime,
  validateUserAnswers
};
