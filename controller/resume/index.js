// @ts-nocheck
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const Resumes = require("../../models/resume");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

let config = {
  service: "gmail",
  auth: {
    user: "kishor81160@gmail.com",
    pass: "xvsy rvxv bktb zjld",
  },
};

const createResume = async (req, res) => {
  try {
    Resumes.create(req.body,).then((data, err) => {
      if (err)
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `Something Wants Wrong`,
          statusCode: StatusCodes.BAD_REQUEST,
          status: ReasonPhrases.BAD_REQUEST,
          cause:error
        });
      else {
        res.status(StatusCodes.CREATED).json({
          message: "One Resume is Created Successfully!",
          status: ReasonPhrases.CREATED,
          statusCode: StatusCodes.CREATED,
          result: {...req.body,id:data.id},
        });
      }
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const getResume = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const resData = await Resumes.find({}, "-__v")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ updatedAt: -1 });

    if (resData.length) {
      // res.forEach((element) => {
      //   // delete element._doc.__v;
      //   element._doc.id = element.id;
      // });
      return res.status(StatusCodes.OK).json({
        message: `Resumes Loaded Successfully!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        result: resData,
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
      message: `Internal server error`,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause:error
    });
  }
};
const getSingleResume = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "record id is not provide",
      statusCode: StatusCodes.BAD_REQUEST,
      status: ReasonPhrases.BAD_REQUEST,
    });
  } else {
    try {
      const record = await Resumes.findOne({ _id: id }, "-__v");

      if (record.id) {
        record.id = record._id;
        return res.status(StatusCodes.OK).json({
          message: `Loaded Successfully!`,
          statusCode: StatusCodes.OK,
          status: ReasonPhrases.OK,
          result: record,
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
        message: `Internal server error`,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }
  }
};
const updateResumeInfo = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Record id is not provide",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

    const contact = await Resumes.findOne({ _id: id });

    if (contact) {
      Resumes.updateOne({ _id: id }, { $set: req.body }, { upsert: true }).then(
        (data, err) => {
          if (err)
            res.status(StatusCodes.BAD_REQUEST).json({
              message: "Update Failed",
              status: ReasonPhrases.BAD_REQUEST,
              statusCode: StatusCodes.BAD_REQUEST,
              cause: err,
            });
          else {
            res.status(StatusCodes.OK).json({
              message: "Update Successfully",
              status: ReasonPhrases.OK,
              statusCode: StatusCodes.OK,
              data: data,
            });
          }
        }
      );
    } else {
      res.status(StatusCodes.NOT_ACCEPTABLE).json({
        message: "Invalid record Id, record is not provded exist..!",
        statusCode: StatusCodes.NOT_ACCEPTABLE,
        status: ReasonPhrases.NOT_ACCEPTABLE,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Please Provide a Valid user id or Server not responding!",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "id is not provide",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

    const resData = await Resumes.findOne({ _id: id });
    if (!resData) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Record does not exist..!",
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    } else {
      Resumes.deleteOne({ _id: id }).then((data, err) => {
        if (err)
          res.status(StatusCodes.BAD_REQUEST).json({
            message: "Delete Failed",
            status: ReasonPhrases.BAD_REQUEST,
            statusCode: StatusCodes.BAD_REQUEST,
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
      message: "Internal Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

module.exports = {
  getResume,
  getSingleResume,
  updateResumeInfo,
  deleteResume,
  createResume,
};
