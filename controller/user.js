const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

const User = require("../models/auth");
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
      const userId = await User.findOne({ _id: id });

      if (userId.id) {
        const resdata = userId._doc;
        delete resdata.hash_password;
        delete resdata._id;
        delete resdata.__v;
        return res.status(StatusCodes.OK).json({
          message: `Profile data has been Loaded Successfully!`,
          statusCode: StatusCodes.OK,
          status: ReasonPhrases.OK,
          result: resdata,
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

const getusers = async (req, res) => {
  try {
    const users = await User.find();

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
    return res.status(StatusCodes.NOT_FOUND).json({
      message: `No information found`,
      statusCode: StatusCodes.NOT_FOUND,
      status: ReasonPhrases.NOT_FOUND,
    });
  }
};

const Profileupdate = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  }

  const id = req.params.id;

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "kishor",
      link: "https://google.com",
    },
  });

  userinfo
    .findByIdAndUpdate(
      id,
      { $set: { ...req.body } },
      { useFindAndModify: false }
    )
    .then((data) => {
      let mailBody = {
        body: {
          name: data.fullName,

          intro: `${data.username} Your profile is updated`,
          // action: {
          //   instructions: "To get started with MyWeb, please click here:",
          //   button: {
          //     color: "#22BC66", // Optional action button color
          //     text: "Login your account",
          //     link: "https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010",
          //   },
          // },
          outro:
            "Need help, or have questions? Just reply to this email, we'd love to help.",
        },
      };
      let mail = MailGenerator.generate(mailBody);
      const mailOptions = {
        from: "kishor81160@gmail.com", // Your email address
        to: data.email, // The user's email address
        subject: "Account has been Updated Successful!", // Email subject
        html: mail, // Email text
      };

      transporter.sendMail(mailOptions).then(() => {
        res.status(StatusCodes.CREATED).json({
          message: "User created Successfully",
          status: ReasonPhrases.CREATED,
          statusCode: StatusCodes.CREATED,
        });
      });

      if (!data) {
        res.status(404).send({
          message: `Cannot Update user with ${id}. Maybe user not found!`,
        });
      } else {
        res.send(data);
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Error Update user information" });
    });
};

const updateUser = async (req, res) => {
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
      let MailGenerator = new Mailgen({
        theme: "default",
        product: {
          name: "kishor",
          link: "https://google.com",
        },
      });
      try {
        User.updateOne(myquery, { $set: req.body }, { upsert: true }).then(
          (data, err) => {
            if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
            else {
              let mailBody = {
                body: {
                  name: user.fullName,
                  table: {
                    data: req.body,
                  },

                  intro: `${user.username} Your profile is updated`,
                  outro:
                    "Need help, or have questions? Just reply to this email, we'd love to help.",
                },
              };
              let mail = MailGenerator.generate(mailBody);
              const mailOptions = {
                from: "kishor81160@gmail.com", // Your email address
                to: user.email, // The user's email address
                subject: "Account has been Updated Successful!", // Email subject
                html: mail, // Email text
              };

              transporter.sendMail(mailOptions).then(() => {
                res.status(StatusCodes.OK).json({
                  message: "User Update Successfully",
                  status: ReasonPhrases.OK,
                  statusCode: StatusCodes.OK,
                  data: data,
                });
              });
            }
          }
        );
      } catch (error) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "User does not exist..!",
          statusCode: StatusCodes.BAD_REQUEST,
          status: ReasonPhrases.BAD_REQUEST,
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
    res.status(StatusCodes.BAD_REQUEST).json({ error });
  }
};

module.exports = { profile, updateUser, Profileupdate, getusers };
