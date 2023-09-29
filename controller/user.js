const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");

const User = require("../models/auth");

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
      console.log(userId);
      const { firstName, lastName, email, password, username } = userId._doc;
      if (userId.id) {
        return res.status(StatusCodes.OK).json({
          message: `found`,
          statusCode: StatusCodes.OK,
          status: ReasonPhrases.OK,
          result: {
            firstName,
            lastName,
            email,
            password,
            username,
          },
        });
      } else {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: `No information found for given id`,
          statusCode: StatusCodes.NOT_FOUND,
          status: ReasonPhrases.NOT_FOUND,
        });
      }
    } catch (error) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: `No information found for given id`,
        statusCode: StatusCodes.NOT_FOUND,
        status: ReasonPhrases.NOT_FOUND,
      });
    }
  }
};

const Profileupdate = (req, res) => {
  if (!req.body) {
    return res.status(400).send({ message: "Data to update can not be empty" });
  }

  const id = req.params.id;
  userinfo
    .findByIdAndUpdate(
      id,
      { $set: { ...req.body } },
      { useFindAndModify: false }
    )
    .then((data) => {
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
      try {
        User.updateOne(myquery, { $set: req.body }, { upsert: true }).then(
          (data, err) => {
            if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
            else
              res.status(StatusCodes.OK).json({
                message: "User Update Successfully",
                status: ReasonPhrases.OK,
                statusCode: StatusCodes.OK,
                data: data,
              });
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

module.exports = { profile, updateUser, Profileupdate };
