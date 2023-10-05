const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

const Contacts = require("../../models/contact");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

let config = {
  service: "gmail",
  auth: {
    user: "kishor81160@gmail.com",
    pass: "xvsy rvxv bktb zjld",
  },
};

let transporter = nodemailer.createTransport(config);

const createContact = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    contactNumber,
    user_id,
    address,
    message,
    socialMedia,
  } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "Please Provide Required Information",
      statusCode: StatusCodes.BAD_REQUEST,
      status: ReasonPhrases.BAD_REQUEST,
    });
  }

  const userData = {
    firstName,
    lastName,
    email,
    contactNumber,
    user_id,
    address,
    message,
    socialMedia,
  };

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "kishor",
      link: "https://google.com",
    },
  });

  try {
    Contacts.create(userData).then((data, err) => {
      if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
      else {
        let mailBody = {
          body: {
            name: data.fullName,
            intro: `We have Received your query`,

            outro: "We'll Soon Connect with you be patients",
          },
        };
        let mail = MailGenerator.generate(mailBody);
        const mailOptions = {
          from: "kishor81160@gmail.com", // Your email address
          to: data.email, // The user's email address
          subject: "We are hare to help", // Email subject
          html: mail, // Email text
        };

        transporter
          .sendMail(mailOptions)
          .then(() => {
            res.status(StatusCodes.CREATED).json({
              message: "Send Successfully!",
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
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Internal Server Error",
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

const getContact = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const contacts = await Contacts.find({}, "-__v")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ updatedAt: -1 });

    if (contacts.length) {
      contacts.forEach((element) => {
        // delete element._doc.__v;
        element._doc.id = element.id;
      });
      return res.status(StatusCodes.OK).json({
        message: `Contacts Loaded Successfully!`,
        statusCode: StatusCodes.OK,
        status: ReasonPhrases.OK,
        result: contacts,
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
        message: `Internal server error`,
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
          res.status(StatusCodes.NOT_MODIFIED).json({
            message: "Update Failed",
            status: ReasonPhrases.NOT_MODIFIED,
            statusCode: StatusCodes.NOT_MODIFIED,
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
      message: "Please Provide a Valid user id or Server not responding!",
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
      message: "Internal Server Error",
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