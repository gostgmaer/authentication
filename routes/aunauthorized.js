const express = require("express");
const unauthorized = express.Router();
const { createContact } = require("../controller/contact/controller");
const {
  validateCreateContact,
  isRequestValidated,
} = require("../validators/contact");

unauthorized
  .route("/contact/create")
  .post(validateCreateContact, isRequestValidated, createContact);

module.exports = unauthorized;
