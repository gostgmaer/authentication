const express = require("express");
var session = require("express-session");
const authRoute = express.Router();

const {
  signUp,
  signIn,
  resetPassword,
  singout,
  varifySession,
  changedPassword,
  forgetPassword,
  accountConfirm,getProfile,getRefreshToken
} = require("../controller/authentication/auth");
const UpdatebyMiddleWare = require("../middleware/updatedBy");
const createMiddleWare = require("../middleware/createMiddleWare");
const userMiddleWare = require("../middleware/userAccess");
const adminMiddleware = require("../middleware/adminAccess");

const {
  validateSignUpRequest,
  isRequestValidated,
  validateSignIpRequest,
  validateForgetPassword,
  validateResetpassword,
  validateChangePassword
} = require("../validator/auth");


authRoute.route("/user/auth/register").post(validateSignUpRequest, isRequestValidated,signUp);
authRoute.route("/user/auth/confirm-account/:token").post(accountConfirm);
authRoute.route("/user/auth/login").post(validateSignIpRequest, isRequestValidated,signIn);
authRoute.route("/user/auth/verify/session").post(varifySession);
authRoute.route("/user/auth/session/refresh/token").post(getRefreshToken);
authRoute.route("/user/auth/reset-password/:token").post(validateResetpassword,isRequestValidated,resetPassword);
authRoute.route("/user/auth/forget-password").post(validateForgetPassword,isRequestValidated,forgetPassword);
authRoute.route("/user/auth/change-password").post(userMiddleWare,UpdatebyMiddleWare,validateChangePassword,isRequestValidated,changedPassword);
authRoute.route("/user/auth/profile").get(userMiddleWare,getProfile);
authRoute.route("/user/auth/logout").post(userMiddleWare,singout);

module.exports = authRoute;
