const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const User = require("../models/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
// const { transporter } = require("../mail/mailer");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const { promisify } = require("util");
const redis = require("redis");

const redisClient = redis.createClient();
const asyncGet = promisify(redisClient.get).bind(redisClient);

// Save the token on the server
function saveTokenToServer(userId, token) {
  // Store the token in Redis with an expiration time
  redisClient.setex(userId, 3600, token); // Expires in 1 hour (in seconds)
}

let config = {
  service: "gmail",
  auth: {
    user: "kishor81160@gmail.com",
    pass: "xvsy rvxv bktb zjld",
  },
};

let transporter = nodemailer.createTransport(config);

var session;

const signUp = async (req, res) => {
  const { firstName, lastName, email, password, username } = req.body;
  if (!firstName || !lastName || !email || !password || !username) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Required Information",
      statusCode: StatusCodes.BAD_REQUEST,
      status: ReasonPhrases.BAD_REQUEST,
    });
  }

  const hash_password = await bcrypt.hash(password, 10);

  const userData = {
    firstName,
    lastName,
    email,
    hash_password,
    username,
  };

  const user = await User.findOne({ email });
  const userId = await User.findOne({ username });

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "kishor",
      link: "https://google.com",
    },
  });

  if (user) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `User with email ${user.email} already registered`,
      statusCode: StatusCodes.BAD_REQUEST,
      status: ReasonPhrases.BAD_REQUEST,
    });
  } else if (userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `User Id ${userId.username} is already taken`,
      statusCode: StatusCodes.BAD_REQUEST,
      status: ReasonPhrases.BAD_REQUEST,
    });
  } else {
    User.create(userData).then((data, err) => {
      if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
      else {
        let mailBody = {
          body: {
            name: data.fullName,

            intro: `Welcome to MyWeb ! We're very excited to have you on board. your username is: ${data.username}`,
            action: {
              instructions: "To get started with MyWeb, please click here:",
              button: {
                color: "#22BC66", // Optional action button color
                text: "Login your account",
                link: "https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010",
              },
            },
            outro:
              "Need help, or have questions? Just reply to this email, we'd love to help.",
          },
        };
        let mail = MailGenerator.generate(mailBody);
        const mailOptions = {
          from: "kishor81160@gmail.com", // Your email address
          to: data.email, // The user's email address
          subject: "Account has been Created", // Email subject
          html: mail, // Email text
        };

        transporter
          .sendMail(mailOptions)
          .then(() => {
            res.status(StatusCodes.CREATED).json({
              message: "User created Successfully",
              status: ReasonPhrases.CREATED,
              statusCode: StatusCodes.CREATED,
            });
          })
          .catch((error) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: "Internal Server Error",
              statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
              status: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });
          });
      }
    });
  }
};

const signIn = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please enter email and password",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.hash_password
      );

      if (isPasswordValid) {
        const token = jwt.sign(
          { user_id: user._id, role: user.role, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        req.session.token = token;
        res.cookie("sessionId", req.session.id);
        
        const { _id, firstName, lastName, email, role, fullName, username } =
          user;

        // req.session.token = token;

        res.status(StatusCodes.OK).json({
          token,
          user: {
            user_id: _id,
            firstName,
            lastName,
            email,
            role,
            fullName,
            username,
          },
          message: "Login Success!",
          statusCode: StatusCodes.OK,
          status: ReasonPhrases.OK,
        });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Password is invalid!",
          statusCode: StatusCodes.UNAUTHORIZED,
          status: ReasonPhrases.UNAUTHORIZED,
        });
      }
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Inavalid User Name!",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server error!",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({
      email,
    });

    let MailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "kishor",
        link: "https://google.com",
      },
    });

    let response = {
      body: {
        name: user.firstName,
        intro: "Password has been reset",

        outro: "Please login to your account",
      },
    };
    let mail = MailGenerator.generate(response);
    const mailOptions = {
      from: "kishor81160@gmail.com", // Your email address
      to: "gostgaming08@gmail.com", // The user's email address
      subject: "Password has been reset", // Email subject
      html: mail, // Email text
    };

    if (!user) {
      // Token is invalid or expired
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Hash the new password before updating
    const hashedPassword = await bcrypt.hash(newPassword, 10); // 10 is the saltRounds

    // Update the user's password and clear reset token fields
    user.hash_password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the user document with the new password
    await user.save();

    // Send the email
    transporter
      .sendMail(mailOptions)
      .then(() => {
        res.status(StatusCodes.OK).json({
          message: "Password reset successfully",
          statusCode: StatusCodes.OK,
          status: ReasonPhrases.OK,
        });
      })
      .catch((error) => {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: "Internal Server Error",
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
      });

    // Password reset successful
    // return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    // Handle error

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Somwthing wants wrong",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

function isAuthenticated(req, res) {
  try {
    if (req?.session && req?.session?.username) {
      res.status(StatusCodes.OK).json({
        message: "Authorised",
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        user: req.session.username,
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    }
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Unauthorized",
      statusCode: StatusCodes.UNAUTHORIZED,
      status: ReasonPhrases.UNAUTHORIZED,
    });
  }
}

const varifyLogin = async (req, res) => {
  try {
    if (req.session) {
      res.status(StatusCodes.OK).json({
        message: "Authorized",
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        user: req.session.username,
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Unauthorized",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "INTERNAL_SERVER_ERROR",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const singout = async (req, res) => {
  req.session.destroy();
  if (!req.session) {
    res.status(StatusCodes.OK).json({
      message: "Success",
      statusCode: StatusCodes.OK,
      status: ReasonPhrases.OK,
    });
  } else {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "INTERNAL_SERVER_ERROR",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const protectedRoute = (req, res) => {
  try {
    const token = req?.session?.token;

  // //  const authHeader = req?.headers?.["authorization"];
  //   if (!token) {
  //     res.status(StatusCodes.UNAUTHORIZED).json({
  //       message: "Unauthorized",
  //       statusCode: StatusCodes.UNAUTHORIZED,
  //       status: ReasonPhrases.UNAUTHORIZED,
  //     });
    
    // if (!authHeader) {
    //   res.status(StatusCodes.UNAUTHORIZED).json({
    //     message: "Unauthorized",
    //     statusCode: StatusCodes.UNAUTHORIZED,
    //     status: ReasonPhrases.UNAUTHORIZED,
    //   });
    // }
    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // You can access user data from the decoded token here
    const user = decoded;

    // Proceed with the protected route logic
    res.status(StatusCodes.OK).json({
      message: "Authorized",
      statusCode: StatusCodes.OK,
      status: ReasonPhrases.OK,
      user: req.session.username,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

module.exports = {
  signUp,
  isAuthenticated,
  signIn,
  resetPassword,
  varifyLogin,
  singout,
  isAuthenticated,
  protectedRoute,
};
