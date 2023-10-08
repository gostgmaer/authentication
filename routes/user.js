const express = require("express");
var session = require("express-session");
const userRoute = express.Router();

const {
  profile,
  updateUser,
  getusers,
  deleteUser,
} = require("../controller/user");



userRoute.route("/user/:id").get(profile);
userRoute.route("/user").get(getusers);
userRoute.route("/user/:id").patch(updateUser);
userRoute.route("/user/profile/:id").get(profile);
userRoute.route("/user/:id").delete(deleteUser);


module.exports = userRoute;
