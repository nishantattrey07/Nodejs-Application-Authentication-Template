const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.email_password
    }
});

async function sendVerificationEmail(name,userEmail, verificationToken) {
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`; // replace with your domain url
    const mailOptions = {
        from: process.env.email,
        to: userEmail,
        subject: 'Email Verification',
        text: `Hi! ${name}, Click on the link to verify your email: ${verificationLink}`,
        html: `<p>Hi! ${name},Click <a href="${verificationLink}">here</a> to verify your email.</p>`
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) console.log(err);
        else console.log('Email sent' + info);
    });
}

module.exports = { sendVerificationEmail };