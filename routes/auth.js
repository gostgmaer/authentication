const express = require("express");
const router = express.Router();
const { signUp, signIn,resetPassword } = require("../controller/auth");
const { profile, updateUser } = require("../controller/user");
const {  
  isRequestValidated,
  validateSignUpRequest,
  validateSignIpRequest,
} = require("../validators/auth");


router.route("/signin").post(validateSignIpRequest, isRequestValidated, signIn);


router.route("/signup").post(validateSignUpRequest, isRequestValidated, signUp);
router.route("/users/:id").get(profile);
router.route("/users/:id").put(updateUser);
router.route("/profile/:id").get(profile);
router.route("/reset-password").post(resetPassword);


module.exports = router;