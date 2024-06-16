const nodemailer = require('nodemailer')
const { Router } = require('express');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.emailPassword
    }
});

async function sendVerificationEmail(userEmail, verificationToken) {
    const verificationLink = `http://localhost:3000/verify-email?token=${verificationToken}`; // replace with your domain url
    const mailOptions = {
        from: process.env.email,
        to: userEmail,
        subject: 'Email Verification',
        text: `Click on the link to verify your email: ${verificationLink}`,
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`
    };
    transporter.sendMail(mailOptions, function(err, info) {
        if (err) console.log(err);
        else console.log(info);
    });
}

transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Email sent: ' + info.response);
    }
});


module.exports = { sendVerificationEmail };