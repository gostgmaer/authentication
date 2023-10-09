// emailService.js

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const mandrillTransport = require('nodemailer-mandrill-transport');
dotenv.config();

// Create and export the Nodemailer transporter

let Mailconfig = {
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  logger: true, // log to console
 // debug: true, // include SMTP traffic in the logs
};

const transporter = nodemailer.createTransport(Mailconfig);

// const transporter = nodemailer.createTransport(
//   mandrillTransport({
//     auth: {
//       apiKey: process.env.EMAIL_PASSWORD,
//     },
//   })
// );

module.exports = transporter;
