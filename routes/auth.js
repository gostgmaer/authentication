const express = require("express");
var session = require("express-session");
const router = express.Router();
const connectDB = require("../db/connect");
//const MongoDBStore = require('express-session-mongodb')(session);
const {
  signUp,
  signIn,
  resetPassword,
  varifyLogin,singout,isAuthenticated
} = require("../controller/auth");
const { profile, updateUser, getusers } = require("../controller/user");
const {
  isRequestValidated,
  validateSignUpRequest,
  validateSignIpRequest,
} = require("../validators/auth");


// const store = new MongoDBStore({
//   mongooseConnection: mongoose.connection,
//   collection: 'sessions',
// });

router.use(
  session({
    secret: process.env.JWT_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
    // store: store
  })
);

router.route("/signin").post(validateSignIpRequest, isRequestValidated, signIn);
router.route("/signout").post(singout);
router.route("/signup").post(validateSignUpRequest, isRequestValidated, signUp);
router.route("/users/:id").get(profile);
router.route("/users").get(getusers);
router.route("/users/:id").put(updateUser);
router.route("/reset-password").post(resetPassword);
router.route("/session").post(isAuthenticated);
router.route("/verify").get(varifyLogin);
router.route("/profile/:id").get(profile);

module.exports = router;
