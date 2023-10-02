const express = require("express");
var session = require("express-session");
const router = express.Router();
const {
  signUp,
  signIn,
  resetPassword,
  varifyLogin,singout
} = require("../controller/auth");
const { profile, updateUser, getusers } = require("../controller/user");
const {
  isRequestValidated,
  validateSignUpRequest,
  validateSignIpRequest,
} = require("../validators/auth");

router.use(
  session({
    secret: process.env.JWT_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
  })
);

router.route("/signin").post(validateSignIpRequest, isRequestValidated, signIn);
router.route("/signout").post(singout);
router.route("/signup").post(validateSignUpRequest, isRequestValidated, signUp);
router.route("/users/:id").get(profile);
router.route("/users").get(getusers);
router.route("/users/:id").put(updateUser);
router.route("/reset-password").post(resetPassword);
router.route("/verify").get(varifyLogin);
router.route("/profile/:id").get(profile);

module.exports = router;
