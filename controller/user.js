const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

const User = require("../models/auth");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
const jwt = require("jsonwebtoken");


const profile = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "user id is not provide",
      statusCode: StatusCodes.BAD_REQUEST,
      status: ReasonPhrases.BAD_REQUEST,
    });
  } else {
    try {
      const userId = await User.findOne(
        { _id: id },
        "-hash_password -__v -confirmToken"
      );

      if (userId.id) {
        // const resdata = userId._doc;

        return res.status(StatusCodes.OK).json({
          message: `Profile data has been Loaded Successfully!`,
          statusCode: StatusCodes.OK,
          status: ReasonPhrases.OK,
          result: userId,
        });
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No information found for given id`,
          statusCode: StatusCodes.NOT_FOUND,
          status: ReasonPhrases.NOT_FOUND,
        });
      }
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: error.message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }
  }
};

const getusers = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const users = await User.find(
      {},
      "-__v -hash_password -resetToken -resetTokenExpiration -confirmToken -update_by"
    )
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ updatedAt: 1 });

    if (users) {
      return res.status(StatusCodes.OK).json({
        message: `Users data has been Loaded Successfully!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        result: users,
      });
    } else {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `No information found`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const Profileupdate = (req, res) => {
  try {
    if (!req.body) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Data to update can not be empty",
        status: ReasonPhrases.NOT_FOUND,
        statusCode: StatusCodes.NOT_FOUND,
        data: data,
      });
    } else {
      const id = req.params.id;
      userinfo
        .findByIdAndUpdate(
          id,
          { $set: { ...req.body } },
          { useFindAndModify: false }
        )
        .then((data) => {
          if (!data) {
            res.status(StatusCodes.NOT_FOUND).json({
              message: `Cannot Update user with ${id}. Maybe user not found!`,
              status: ReasonPhrases.NOT_FOUND,
              statusCode: StatusCodes.NOT_FOUND,
              data: data,
            });
          } else {
            res.status(StatusCodes.OK).json({
              message: "User Update Successfully",
              status: ReasonPhrases.OK,
              statusCode: StatusCodes.OK,
              data: data,
            });
          }
        })
        .catch((err) => {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: err.message,
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            status: ReasonPhrases.INTERNAL_SERVER_ERROR,
          });
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

const updateUser = async (req, res) => {
  const token = req?.headers?.authorization;
  const sessionId = req?.headers?.session_id;
  var decodeduser = undefined;
  if (token) {
    decodeduser = jwt.verify(token, process.env.JWT_SECRET);
  }

  const { id } = req.params;
  try {
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "user id is not provide",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ _id: id });

    var myquery = { _id: id };

    if (user) {
      try {
        const body = { ...req.body, update_by: decodeduser?.email };

        User.updateOne(myquery, { $set: body }, { upsert: true }).then(
          (data, err) => {
            if (err)
              res.status(StatusCodes.NOT_MODIFIED).json({
                message: "Update Failed",
                status: ReasonPhrases.NOT_MODIFIED,
                statusCode: StatusCodes.NOT_MODIFIED,
                cause: err,
              });
            else {
              res.status(StatusCodes.OK).json({
                message: "User Update Successfully",
                status: ReasonPhrases.OK,
                statusCode: StatusCodes.OK,
                data: data,
              });
            }
          }
        );
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          message: error.message,
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          status: ReasonPhrases.INTERNAL_SERVER_ERROR,
          cause: error,
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
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "id is not provide",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

    const user = await User.findOne({ _id: id });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "User does not exist..!",
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    } else {
      User.deleteOne({ _id: id }).then((data, err) => {
        if (err)
          res.status(StatusCodes.NOT_IMPLEMENTED).json({
            message: "Delete Failed",
            status: ReasonPhrases.NOT_IMPLEMENTED,
            statusCode: StatusCodes.NOT_IMPLEMENTED,
            cause: err,
          });
        else {
          res.status(StatusCodes.OK).json({
            message: "Delete Success",
            status: ReasonPhrases.OK,
            statusCode: StatusCodes.OK,
            data: data,
          });
        }
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

module.exports = { profile, updateUser, Profileupdate, getusers, deleteUser };
