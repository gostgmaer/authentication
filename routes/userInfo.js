const express = require("express");
const router = express.Router();
const { signUp, signIn } = require("../controller/auth");
const { profile, updateUser } = require("../controller/user");
const {  
  isRequestValidated,
  validateSignUpRequest,
  validateSignIpRequest,
} = require("../validators/auth");


router.route("/users/:id").get(req,profile);


// router.route("/users/:id").put(validateSignUpRequest, isRequestValidated, signUp);


module.exports = router;