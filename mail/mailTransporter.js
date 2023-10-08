// emailService.js

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Create and export the Nodemailer transporter

let Mailconfig = {
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};

const transporter = nodemailer.createTransport(Mailconfig);

module.exports = transporter;
