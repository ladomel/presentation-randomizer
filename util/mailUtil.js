const nodemailer = require('nodemailer');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

module.exports = {
    sendEmail(to, subject, body) {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_UTIL_MAIL,
                pass: process.env.MAIL_UTIL_PASSWORD
            }
        });

        let mailOptions = {
            from: process.env.MAIL_UTIL_MAIL,
            to: to,
            subject: subject,
            text: body
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}

