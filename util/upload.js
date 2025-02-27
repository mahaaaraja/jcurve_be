const fs = require("fs");
const path = require('path');
const multer = require("multer");
const ErrorHandler = require('../util/errors');
const {verifyToken} = require("./jwtTokens");
const dotenv = require("dotenv");
const { dir } = require("console");
const { DATE } = require("sequelize");
dotenv.config();

const maxAllowedSize = 10 * 1024 * 1024;


let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fileSize = parseInt(req.headers["content-length"]);
        if (fileSize <= maxAllowedSize) {
            let directoryPath = "";
            if (file.fieldname === "profilePicture") {
                directoryPath = "./resources/profile_pictures";
            } else if (file.fieldname === "certificateFile") {
                directoryPath = "./resources/certificates";
            } else if (file.fieldname === "certificate") {
                directoryPath = "./resources/certificates";
            } else if (file.fieldname === "hrJobFile") {
                directoryPath = "./resources/hr_job_files";
            } else if (file.fieldname === "resumeFile") {
                directoryPath = "./resources/resume_files";
            } else if (file.fieldname === "jcurveResume") {
                directoryPath = "./resources/jcurve_resumes";
            } else if (file.fieldname === "tenthMarksheet") {
                directoryPath = "./resources/tenth_mark_sheets";
            } else if (file.fieldname === "twelfthMarksheet") {
                directoryPath = "./resources/twelfth_mark_sheets";
            } else if (file.fieldname === "ugMarksheet") {
                directoryPath = "./resources/ug_mark_sheets";
            } else if (file.fieldname === "thumbnail") {
                if (req.params.type === 'goal') {
                    directoryPath = "./resources/goalThumbnails";
                } else if (req.params.type === 'company') {
                    directoryPath = "./resources/companyThumbnails";
                }
            }  else if (file.fieldname === "organizationLogo") {
                directoryPath = "./resources/organization_logos";
            }
            if(directoryPath) {
                if (!fs.existsSync(directoryPath)) {
                    fs.mkdirSync(directoryPath, {recursive: true});
                }
                cb(null, directoryPath);
            }
            
        } else {
            return cb(ErrorHandler.fileTypeError("File size exceeds maximum limit 10 MB"));
        }
    },
    filename: (req, file, cb) => {
        let accessToken;
        let newFileName = "";
        let decoded = req.userId ? {userId: req.userId} : null;
        if (!decoded.userId && req.headers['authorization']) {
            accessToken = req.headers['authorization'].split(' ')[1];
            decoded = verifyToken(accessToken, process.env.ACCESS_TOKEN_SECRET);
        }
        if (file.fieldname === "profilePicture") {
            var filetypes = /jpg|jpeg|png/;
            newFileName = "profilePic_";
        } else if (file.fieldname === "certificateFile") {
            var filetypes = /jpg|jpeg|png|pdf/;
            newFileName = "certificate_";
        } else if (file.fieldname === "certificate") {
            var filetypes = /jpg|jpeg|png|pdf/;
            newFileName = "certificate_";
        } else if (file.fieldname === "hrJobFile") {
            var filetypes = /pdf|doc|docx|txt/;
            newFileName = "hrJobFile_";
        } else if (file.fieldname === "resumeFile") {
            var filetypes = /pdf|doc|docx|txt/;
            newFileName = "resumeFile_";
        } else if (file.fieldname === "jcurveResume") {
            var filetypes = /pdf|doc|docx|txt/;
            newFileName = "jcurveResume_";
        } else if (file.fieldname === "tenthMarksheet") {
            var filetypes = /pdf/;
            newFileName = "tenthMarksheet_";
        } else if (file.fieldname === "twelfthMarksheet") {
            var filetypes = /pdf/;
            newFileName = "twelfthMarksheet_";
        } else if (file.fieldname === "ugMarksheet") {
            var filetypes = /pdf/;
            newFileName = "ugMarksheet_";
        } else if (file.fieldname === "thumbnail") {
            var filetypes = /jpg|jpeg|png/;
            newFileName = `thumbnail_${req.params.type}_` + file.originalname + Date.now() + "_" + path.extname(file.originalname).toLowerCase();
        } else if (file.fieldname === "organizationLogo") {
            var filetypes = /jpg|jpeg|png/;
            newFileName = "organizationLogo_";
        }

        if(newFileName) {
            newFileName += file.originalname + (file.fieldname === "thumbnail" ? "" : (decoded?.userId ? decoded.userId : "")) + Date.now() + "_" + path.extname(file.originalname).toLowerCase();
        }
        
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            const fileSize = parseInt(req.headers["content-length"]);
            if (fileSize <= maxAllowedSize) {
                cb(null, newFileName);
            } else {
                return cb(ErrorHandler.fileTypeError("File size exceeds maximum limit 10 MB"));
            }
        } else {
            return cb(ErrorHandler.fileTypeError(`Unsupported file format. Only ${filetypes.toString().replaceAll('/', '').replaceAll('|', ', ')} are allowed.`));
        }
    }
});


const uploadAnyFile = multer({ storage: storage });

module.exports = uploadAnyFile;
