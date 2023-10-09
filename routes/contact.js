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
  .route("/contact/create")
  .post(validateCreateContact, isRequestValidated, createContact);
contactRoute.route("/contact/:id").get(getSingleContact);
contactRoute.route("/contact").get(getContact);
contactRoute.route("/contact/:id").patch(updateContactInfo);
contactRoute.route("/contact/:id").delete(deleteContact);

module.exports = contactRoute;
