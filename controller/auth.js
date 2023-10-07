const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const User = require("../models/auth");
const Sessions = require("../models/session");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
// const { transporter } = require("../mail/mailer");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const crypto = require("crypto");
const { promisify } = require("util");
const redis = require("redis");
const sessionStore = require("../db/session");
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
      if (err) return res.status(StatusCodes.BAD_REQUEST).json({
        message: err.message,
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
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
                link: `${process.env.LOGINHOST}/${process.env.CLIENTLOGINPAGE}`,
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
              message: error.message,
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
        const LoggedinUser = await User.findOne(
          { email: req.body.email },
          "-__v -hash_password -createdAt -updatedAt"
        );

        const token = jwt.sign(
          {
            user_id: LoggedinUser.id,
            role: LoggedinUser.role,
            email: LoggedinUser.email,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "7d",
          }
        );
        req.session.token = token;
        req.session.sessionId = req.session.id;
        res.cookie("sessionId", req.session.id);

        // req.session.token = token;

        const sessionID = req.session.id;
        res.status(StatusCodes.OK).json({
          token,
          user: LoggedinUser,
          session_id: sessionID,
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
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid or expired token",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

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
        intro: "Your password has been successfully reset.",
        action: {
          instructions: `You can now log in to your account with your new password.`,
          button: {
            color: "#22BC66", // Optional action button color
            text: "Login Now",
            link: `${process.env.LOGINHOST}/${process.env.CLIENTLOGINPAGE}`,
          },
        },
        outro:
          "If you did not request this, please ignore this email and your password will remain unchanged.",
      },
    };
    let mail = MailGenerator.generate(response);
    const mailOptions = {
      from: "kishor81160@gmail.com", // Your email address
      to: user.email, // The user's email address
      subject: "Password Reset Successful", // Email subject
      html: mail, // Email text
    };
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the saltRounds
    user.hash_password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();
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
          message: error.message,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          status: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
      });

    // Password reset successful
    // return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    // Handle error

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
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
      message: error.message,
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
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const singout = async (req, res) => {
  try {
    const sessionId = req?.headers?.session_id;
    req.session.destroy((err) => {
      if (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: err.message,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          status: ReasonPhrases.INTERNAL_SERVER_ERROR,
          cause: err,
        });
      } else {
        // Successfully destroyed the session, now remove it from the database

        sessionStore.destroy(sessionId, (destroyErr) => {
          if (destroyErr) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: error.message,
              statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
              status: ReasonPhrases.INTERNAL_SERVER_ERROR,
              cause: destroyErr,
            });
          } else {
            // Redirect to a logout success page or another route
            res.status(StatusCodes.OK).json({
              message: "Logout Success",
              statusCode: StatusCodes.OK,
              status: ReasonPhrases.OK,
            });
          }
        });
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

const protectedRoute = async (req, res) => {
  try {
    const token = req?.headers?.authorization;
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Token Not Provided",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    }
    const decodeduser = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeduser) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "Authorization Token is Not Valid",
        statusCode: StatusCodes.FORBIDDEN,
        status: ReasonPhrases.FORBIDDEN,
      });
    }
    const user = await User.findOne({ _id: decodeduser.user_id });
    if (!user) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "invalid user",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    } else {
      const {
        firstName,
        lastName,
        username,
        fullName,
        email,
        contactNumber,
        address,
        socialMedia,
        profilePicture,
      } = user;
      res.status(StatusCodes.OK).json({
        message: "Authorized",
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        user: {
          firstName,
          fullName,
          lastName,
          username,
          email,
          contactNumber,
          address,
          socialMedia,
          profilePicture,
        },
      });
    }
    // Proceed with the protected route logic
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const varifySession = async (req, res) => {
  try {
    const token = req?.headers?.authorization;
    const sessionId = req?.headers?.session_id;
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Token Not Provided",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    }
    if (!sessionId) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Session Not Found",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    }

    const decodeduser = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodeduser) {
      res.status(StatusCodes.FORBIDDEN).json({
        message: "Authorization Token is Not Valid",
        statusCode: StatusCodes.FORBIDDEN,
        status: ReasonPhrases.FORBIDDEN,
      });
    }

    sessionStore.get(sessionId, async (error, session) => {
      if (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: error.message,
          statusCode: StatusCodes.BAD_REQUEST,
          status: ReasonPhrases.BAD_REQUEST,
          cause: error,
        });
      } else if (!session) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Session Expired",
          statusCode: StatusCodes.UNAUTHORIZED,
          status: ReasonPhrases.UNAUTHORIZED,
        });
      } else {
        // Session data is available in the 'session' variable
        sessionData = session;

        const user = await User.findOne(
          { _id: decodeduser.user_id },
          "-__v -hash_password -createdAt -updatedAt"
        );
        res.status(StatusCodes.OK).json({
          message: "Authorized",
          statusCode: StatusCodes.OK,
          status: ReasonPhrases.OK,
          user: user,
          token: session.token,
        });
      }
    });

    // Proceed with the protected route logic
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({
      email,
    });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Email address is not registered",
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    } else {
      const resetToken = jwt.sign(
        {
          user_id: user.id,
          role: user.role,
          email: user.email,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1h",
        }
      );
      const resetTokenExpiration = Date.now() + 3600000; // 1 hour

      const data = await User.updateOne(
        { email: req.body.email },
        {
          resetToken,
          resetTokenExpiration,
        }
      );
      if (!data) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "Reset password email generation failed",
          statusCode: StatusCodes.BAD_REQUEST,
          status: ReasonPhrases.BAD_REQUEST,
        });
      } else {
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
            intro:
              "You are receiving this because you (or someone else) have requested a password reset for your account.",
            action: {
              instructions: `Click on the following link to reset your password:`,
              button: {
                color: "#22BC66", // Optional action button color
                text: "Reset Password",
                link: `${process.env.LOGINHOST}/${process.env.CLIENTRESETPASSURL}?token=${resetToken}`,
              },
            },
            outro:
              "If you did not request this, please ignore this email and your password will remain unchanged.",
          },
        };
        let mail = MailGenerator.generate(response);
        const mailOptions = {
          from: "kishor81160@gmail.com", // Your email address
          to: user.email, // The user's email address
          subject: "Password Reset", // Email subject
          html: mail, // Email text
        };

        transporter
          .sendMail(mailOptions)
          .then(() => {
            res.status(StatusCodes.OK).json({
              message: "Password reset email has been sent successfully. Please check your mailbox",
              statusCode: StatusCodes.OK,
              status: ReasonPhrases.OK,
            });
          })
          .catch((error) => {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
              message: error.message,
              statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
              status: ReasonPhrases.INTERNAL_SERVER_ERROR,
           
            });
          });
      }
    }
  } catch (error) {
    // Handle error

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
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
  varifySession,
  forgetPassword,
};
