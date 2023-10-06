const express = require("express");
const genericRoute = express.Router();
const {
  create,
  getAllRecord
} = require("../controller/generic/controller");



genericRoute
  .route("/record/:containerID/table/:tableId")
  .post(create);
  // genericRoute.route("/record/:containerID/table/:tableId/:id").get(getSingleContact);
  genericRoute.route("/record/search/:containerID/table/:tableId").get(getAllRecord);
  // genericRoute.route("/record/:containerID/table/:tableId/:id").patch(updateContactInfo);
  // genericRoute.route("/record/:containerID/table/:tableId/:id").delete(deleteContact);

module.exports = genericRoute;
