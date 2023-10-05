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
  .route("/resume")
  .post(validateCreateContact, isRequestValidated, createResume);
  resumeRoute.route("/resumes/:id").get(getSingleResume);
  resumeRoute.route("/resumes").get(getResume);
  resumeRoute.route("/resumes/:id").patch(updateResumeInfo);
  resumeRoute.route("/resumes/:id").delete(deleteResume);

module.exports = resumeRoute;
