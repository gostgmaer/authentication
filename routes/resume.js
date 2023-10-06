const express = require("express");
const resumeRoute = express.Router();
const {
    getResume,
    getSingleResume,
    updateResumeInfo,
    deleteResume,
    createResume,
} = require("../controller/resume/index");
const {
  validateCreateContact,
  isRequestValidated,
} = require("../validators/contact");



resumeRoute
  .route("/resume/create")
  .post(validateCreateContact, isRequestValidated, createResume);
  resumeRoute.route("/resume/:id").get(getSingleResume);
  resumeRoute.route("/resume").get(getResume);
  resumeRoute.route("/resume/:id").patch(updateResumeInfo);
  resumeRoute.route("/resume/:id").delete(deleteResume);

module.exports = resumeRoute;
