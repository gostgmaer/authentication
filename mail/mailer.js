const nodemailer = require("nodemailer");

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // use TLS
  auth: {
    user: "avaroleg@gmail.com",
    pass: "avarole@123",
  },
});

module.exports = transporter;
