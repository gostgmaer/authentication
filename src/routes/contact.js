const express = require("express");
const contactRoute = express.Router();
const authenticateToken = require("../middleware/authMiddleware");
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

contactRoute.route("/contact/:id").get(authenticateToken, getSingleContact);
contactRoute.route("/contact").get(authenticateToken, getContact);
contactRoute.route("/contact/:id").patch(authenticateToken, updateContactInfo);
contactRoute.route("/contact/:id").delete(authenticateToken, deleteContact);

module.exports = contactRoute;
