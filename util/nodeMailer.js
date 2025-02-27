const nodemailer = require('nodemailer');

exports.sendMail = async (emails, subject, html) => {
    let transporter = nodemailer.createTransport({
        host: process.env.MAILGUN_HOST,
        port: process.env.MAILGUN_PORT,
        secure: false,
        auth: {
            user: process.env.MAILGUN_USERNAME,
            pass: process.env.MAILGUN_PASSWORD
        }
    });
    await transporter.sendMail({
        from: {
            name: "JCurve",
            address: `${process.env.EMAIL_FROM_ADDRESS}`
        },
        to: emails,
        subject: subject,
        html: html
    })
};