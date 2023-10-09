const express = require("express");
var session = require("express-session");
const router = express.Router();
const connectDB = require("../db/connect");
//const MongoDBStore = require('express-session-mongodb')(session);
const {
  signUp,
  signIn,
  resetPassword,
  singout,
  varifySession,
  forgetPassword,
  accountConfirm,
} = require("../controller/auth");
const {
  validateSignUpRequest,
  isRequestValidated,
  validateSignIpRequest,
  validateForgetPassword,
  validateResetpassword,
} = require("../validators/auth");

/**
 * @swagger
 * tags:
 *   - name: Auth Controller
 *     description: Authentication and user registration operations
 * /api/user/register:
 *   post:
 *     summary: Register a new user
 *     tags:
 *       - Auth Controller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       409:
 *         description: User or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 */

router
  .route("/user/register")
  .post(validateSignUpRequest, isRequestValidated, signUp);

/**
 * @swagger
 * /api/user/auth/login:
 *   post:
 *     summary: Sign in a user
 *     tags:
 *       - Auth Controller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User signed in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *
 *                 session_id:
 *                   type: string
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 */

router
  .route("/user/auth/login")
  .post(validateSignIpRequest, isRequestValidated, signIn);

/**
 * @swagger
 * /api/user/auth/verify/session:
 *   post:
 *     summary: Verify user session
 *     tags:
 *       - Auth Controller
 *     parameters:
 *       - in: header
 *         name: authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: JWT token for authorization
 *       - in: header
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: User session is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 user:
 *                   type: object
 *
 *                 token:
 *                   type: string
 *       400:
 *         description: Bad Request or Session Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 cause:
 *                   type: object
 *       401:
 *         description: Unauthorized or Session Expired
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       403:
 *         description: Forbidden - Authorization Token is Not Valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 */

router.route("/user/auth/verify/session").post(varifySession);

/**
 * @swagger
 * /api/user/auth/reset-password/{token}:
 *   post:
 *     summary: Reset user password
 *     tags:
 *       - Auth Controller
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token received via email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 */
router
  .route("/user/auth/reset-password/:token")
  .post(validateResetpassword, isRequestValidated, resetPassword);

/**
 * @swagger
 * /api/user/auth/forget-password:
 *   post:
 *     summary: Request a password reset link via email
 *     tags:
 *       - Auth Controller
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset email sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       400:
 *         description: Email address is not registered or reset password email generation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 */

router
  .route("/user/auth/forget-password")
  .post(validateForgetPassword, isRequestValidated, forgetPassword);

/**
 * @swagger
 * /api/user/auth/confirm-account/{token}:
 *   post:
 *     summary: Confirm user account via email token
 *     tags:
 *       - Auth Controller
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Confirmation token received via email
 *     responses:
 *       200:
 *         description: Account confirmed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *                 result:
 *                   type: object
 *
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 */

router.route("/user/auth/confirm-account/:token").post(accountConfirm);

/**
 * @swagger
 * /api/user/auth/signout:
 *   post:
 *     summary: Sign out and destroy user session
 *     tags:
 *       - Auth Controller
 *     responses:
 *       200:
 *         description: Logout success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 statusCode:
 *                   type: integer
 *                 status:
 *                   type: string
 */

router.route("/user/auth/signout").post(singout);

module.exports = router;
