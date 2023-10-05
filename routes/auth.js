const express = require("express");
var session = require("express-session");
const router = express.Router();
const connectDB = require("../db/connect");
//const MongoDBStore = require('express-session-mongodb')(session);
const {
  signUp,
  signIn,
  resetPassword,
  varifyLogin,
  singout,
  isAuthenticated,
  protectedRoute,varifySession
} = require("../controller/auth");
const { authenticateToken } = require("../middleware/middleware");
const { profile, updateUser, getusers,deleteUser } = require("../controller/user");
const {
  isRequestValidated,
  validateSignUpRequest,
  validateSignIpRequest,
} = require("../validators/auth");



router.route("/signin").post(validateSignIpRequest, isRequestValidated, signIn);
router.route("/signout").post(singout);
router.route("/signup").post(validateSignUpRequest, isRequestValidated, signUp);
router.route("/users/:id").get(profile);
router.route("/users").get(getusers);
router.route("/users/:id").put(updateUser);
router.route("/reset-password").post(resetPassword);
router.route("/session").post(isAuthenticated);
router.route("/verify").get(varifyLogin);
router.route("/protected").get(protectedRoute);
router.route("/profile/:id").get(profile);
router.route("/protected/resource").get(authenticateToken);
router.route("/user/:id").delete(deleteUser);
router.route("/verify/session").post(varifySession);

module.exports = router;
