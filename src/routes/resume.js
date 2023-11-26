const express = require("express");
const resumeRoute = express.Router();
const {
  getResume,
  getSingleResume,
  updateResumeInfo,
  deleteResume,
  createResume,
} = require("../controller/resume/index");
const authenticateToken = require("../middleware/authMiddleware");
const {
  validateCreateContact,
  isRequestValidated,
} = require("../validators/contact");

resumeRoute
  .route("/resume/create")
  .post(
    authenticateToken,
    validateCreateContact,
    isRequestValidated,
    createResume
  );
resumeRoute.route("/resume/:id").get(authenticateToken, getSingleResume);
resumeRoute.route("/resume").get(authenticateToken, getResume);
resumeRoute.route("/resume/:id").patch(authenticateToken, updateResumeInfo);
resumeRoute.route("/resume/:id").delete(authenticateToken, deleteResume);

module.exports = resumeRoute;
