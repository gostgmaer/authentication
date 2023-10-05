const express = require("express");
const contactRoute = express.Router();
const {
  updateContactInfo,
  deleteContact,
  getContact,
  createContact,
  getSingleContact,
} = require("../controller/contact/controller");
const {
  validateCreateContact,
  isRequestValidated,
} = require("../validators/contact");


contactRoute
  .route("/contact")
  .post(validateCreateContact, isRequestValidated, createContact);
  contactRoute.route("/contacts/:id").get(getSingleContact);
  contactRoute.route("/contacts").get(getContact);
  contactRoute.route("/contacts/:id").patch(updateContactInfo);
  contactRoute.route("/contacts/:id").delete(deleteContact);

module.exports = contactRoute;
