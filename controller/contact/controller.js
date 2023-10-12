const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const createMailOptions = require("../../mail/mailOptions");
const transporter = require("../../mail/mailTransporter");
const Contacts = require("../../models/contact");
const nodemailer = require("nodemailer");
const { createProjectionFromArray } = require("../../utils/service");

const createContact = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    if (!firstName || !lastName || !email || !message) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Please Provide Required Information",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    } else {
      Contacts.create(req.body).then((data, err) => {
        if (err)
          res.status(StatusCodes.BAD_REQUEST).json({
            message: err.message,
            statusCode: StatusCodes.BAD_REQUEST,
            status: ReasonPhrases.BAD_REQUEST,
            cause: error,
          });
        else {
          let mailBody = {
            body: {
              name: data.fullName,
              intro: `Welcome to ${process.env.APPLICATION_NAME}! We are excited to work with you.`,
              additionalInfo: `Thank you for choosing ${process.env.APPLICATION_NAME}. You now have access to our premium features, priority customer support.`,

              outro:
                "Need help, or have questions? Just reply to this email, we'd love to help.",
            },
          };

          transporter
            .sendMail(
              createMailOptions(
                "salted",
                data.email,
                `Welcome to ${process.env.APPLICATION_NAME} - We Received Your Query`,
                mailBody
              )
            )
            .then(() => {
              res.status(StatusCodes.CREATED).json({
                message: "Contact Send Successfully",
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
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const getContact = async (req, res) => {
  try {
    const { sort, page, limit, filter, select_keys } = req.query;

    var arrayOfValues = "";
    const selectKeys = select_keys;
    if (selectKeys) {
      const cleanedArray = selectKeys
        .split(",")
        .map((value) => value.replace(/'/g, ""));
      arrayOfValues = createProjectionFromArray(cleanedArray);
    }
    var query = {};

    if (filter) {
      const filterObj = JSON.parse(filter);
      for (const key in filterObj) {
        query[key] = filterObj[key];
      }
    }

    var sortOptions = {};

    if (sort) {
      const [sortKey, sortOrder] = sort.split(":");
      sortOptions[sortKey] = sortOrder === "desc" ? -1 : 1;
    }

    var skip = 0;

    if (limit) {
      skip = (parseInt(page) - 1) * parseInt(limit);
    }

    // const page = parseInt(req.query.page);
    // const limit = parseInt(req.query.limit);
    const contacts = await Contacts.find({ ...query })
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const recCount = await Contacts.countDocuments({
      ...query,
    });
    if (contacts.length) {
      // contacts.forEach((element) => {
      //   element._doc.id = element.id;
      // });
      return res.status(StatusCodes.OK).json({
        message: `Contacts Loaded Successfully!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        result: contacts,
        total: recCount,
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
const getSingleContact = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "record id is not provide",
      statusCode: StatusCodes.BAD_REQUEST,
      status: ReasonPhrases.BAD_REQUEST,
    });
  } else {
    try {
      const record = await Contacts.findOne({ _id: id }, "-__v");

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
        message: error.message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      });
    }
  }
};
const updateContactInfo = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Record id is not provide",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

    const contact = await Contacts.findOne({ _id: id });

    if (contact) {
      Contacts.updateOne(
        { _id: id },
        { $set: req.body },
        { upsert: true }
      ).then((data, err) => {
        if (err)
          res.status(StatusCodes.BAD_REQUEST).json({
            message: err.message,
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
      });
    } else {
      res.status(StatusCodes.NOT_ACCEPTABLE).json({
        message: "Invalid record Id, record is not provded exist..!",
        statusCode: StatusCodes.NOT_ACCEPTABLE,
        status: ReasonPhrases.NOT_ACCEPTABLE,
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

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "id is not provide",
        statusCode: StatusCodes.BAD_REQUEST,
        status: ReasonPhrases.BAD_REQUEST,
      });
    }

    const user = await Contacts.findOne({ _id: id });
    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({
        message: "Record does not exist..!",
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    } else {
      Contacts.deleteOne({ _id: id }).then((data, err) => {
        if (err)
          res.status(StatusCodes.BAD_REQUEST).json({
            message: err.message,
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
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
      cause: error,
    });
  }
};

module.exports = {
  updateContactInfo,
  deleteContact,
  getContact,
  createContact,
  getSingleContact,
};
