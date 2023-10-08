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
  protectedRoute,
  varifySession,forgetPassword,accountConfirm
} = require("../controller/auth");
const {
  validateSignUpRequest,
  isRequestValidated,
  validateSignIpRequest,
  validateForgetPassword,
  validateResetpassword,
} = require("../validators/auth");

/**
 * @openapi
 * '/api/user/login':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Login as a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router
  .route("/user/login")
  .post(validateSignIpRequest, isRequestValidated, signIn);

/**
 * @openapi
 * '/api/user/verify/session':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Verify a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - username
 *            properties:
 *              username:
 *                type: string
 *                default: johndoe
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        desccription: Server Error
 */

router.route("/user/verify/session").post(varifySession);


/**
 * @openapi
 * '/api/user/reset-password':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Reset user password
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - email
 *              - newPassword
 *            properties:
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              newPassword:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */

router.route("/user/reset-password/:token").post(validateResetpassword, isRequestValidated,resetPassword);
router.route("/user/forget-password").post(validateForgetPassword, isRequestValidated,forgetPassword);

router.route("/user/signout").post(singout);

//user registration
/** POST Methods */
/**
 * @openapi
 * '/api/user/register':
 *  post:
 *     tags:
 *     - User Controller
 *     summary: Create a user
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *           schema:
 *            type: object
 *            required:
 *              - username
 *              - email
 *              - password
 *            properties:
 *              username:
 *                type: string
 *                default: johndoe
 *              email:
 *                type: string
 *                default: johndoe@mail.com
 *              password:
 *                type: string
 *                default: johnDoe20!@
 *     responses:
 *      201:
 *        description: Created
 *      409:
 *        description: Conflict
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */
router
  .route("/user/register")
  .post(validateSignUpRequest, isRequestValidated, signUp);

  
router.route("/user/confirm-account/:token").post(accountConfirm);
/** GET Methods */
/**
 * @openapi
 * '/api/user/{id}':
 *  get:
 *     tags:
 *     - User Controller
 *     summary: Get a user by id
 *     parameters:
 *      - name: id
 *        in: path
 *        description: The id of the user
 *        required: true
 *     responses:
 *      200:
 *        description: Fetched Successfully
 *      400:
 *        description: Bad Request
 *      404:
 *        description: Not Found
 *      500:
 *        description: Server Error
 */

router.route("/user/session").post(isAuthenticated);
router.route("/user/verify").get(varifyLogin);
router.route("/user/protected").get(protectedRoute);


module.exports = router;
