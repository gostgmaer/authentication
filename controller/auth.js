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
        res.status(StatusCodes.CREATED).json({
          message: "User created Successfully",
          status: ReasonPhrases.CREATED,
          statusCode: StatusCodes.CREATED,
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

      const isPasswordValid = await bcrypt.compare(req.body.password, user.hash_password);

     

      if (isPasswordValid) {
        const token = jwt.sign(
          { user_id: user._id, role: user.role, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: "30d" }
        );
        const { _id, firstName, lastName, email, role, fullName } = user;
        res.status(StatusCodes.OK).json({
          token,
          user: { user_id: _id, firstName, lastName, email, role, fullName },
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
        message: "User does not exist..!",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Somwthing wants wrong",
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

    // Password reset successful
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    // Handle error
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { signUp, signIn, resetPassword };
