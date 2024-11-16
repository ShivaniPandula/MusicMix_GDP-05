const nodemailer = require("nodemailer");
const dotenv=require('dotenv').config();
const sendEmail = process.env.EMAIL_ID
const mailPass = process.env.EMAIL_PASSWORD

const sendOTP = (email,OTP) => {
    const passwordMsg = {
        from: sendEmail,
        to: email,
        subject: `Music Mix - Account Verification`,
        html:`<div><h4>Hi, Your OTP to verify mail in Music Mix platform is - ${OTP} .</h4> <br> <h5>Thank you.</h5>`
     }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sendEmail,
            pass: mailPass
        }
    });

    return new Promise((resolve, reject) => {
        transporter.sendMail(passwordMsg, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Email sent");
                resolve();
            }
        });
    });
};

const notifyUser = (mail,message) => {
    const passwordMsg = {
        from: sendEmail,
        to: mail,
        subject: `Update From Music Mix`,
        html:`<div><h4>Hi, ${message} </h4>`
     }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sendEmail,
            pass: mailPass
        }
    });

    return new Promise((resolve, reject) => {
        transporter.sendMail(passwordMsg, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Email sent");
                resolve();
            }
        });
    });
}

const sendResetLink = (mail,link) => {
    const passwordMsg = {
        from: sendEmail,
        to: mail,
        subject: `Reset Password Link`,
        html:`<div><h4>Hi, Here is the link for reseting password of your account in Music Mix platform\n kindly reset the password\n Note:The link is only vaild for 30 minutes after that the link expries </h4><a href=${link}>Click here</a>`
     }

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: sendEmail,
            pass: mailPass
        }
    });

    return new Promise((resolve, reject) => {
        transporter.sendMail(passwordMsg, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log("Email sent");
                resolve();
            }
        });
    });
};


module.exports={
    sendOTP,
    notifyUser,
    sendResetLink
}