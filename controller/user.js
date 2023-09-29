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


const updateProfile = async (req,res) => {
    const id = req.params.id;
      
    // Get the updated user information from the request body
    const updatedUser = req.body;
  
    // Update the user in the database
    console.log(res.body)
    await User.findByIdAndUpdate(req.params.id, req.body);
  
    // Send a success response
    res.status(200).json({
      message: 'User updated successfully'
    });
}


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

    userInfo = {
      data: {
        exp: 1695973022,
        iat: 1695969422,
        auth_time: 1695969416,
        jti: "3a52da07-ad3c-4c1d-a830-76a650c01c6d",
        iss: "https://ecwg-ss-dt.inadev.net/client-keycloak/auth/realms/iacc-dev",
        sub: "07a6334f-a41c-4bb3-ae74-a601a2a3328f",
        typ: "Bearer",
        azp: "user-auth-dev",
        nonce: "cXh2UnVzajg5M2RVeGdlQ3pUU1BnNzRXQmV1ZUE4bG9acVJjSXQuS2ZDY0pE",
        session_state: "27dc53ca-a9ee-487d-8b8e-735d52fb2679",
        acr: "1",
        "allowed-origins": [
          "https://iacc-enforcement-demo.inadev.net/*",
          "https://iacc-enforcement-dev.inadev.net/*",
          "iacc-enforcement-dev.inadev.net",
          "http://localhost:4200/*",
        ],
        realm_access: {
          roles: ["ms_iacc_admin", "offline_access"],
        },
        scope: "openid email profile",
        sid: "27dc53ca-a9ee-487d-8b8e-735d52fb2679",
        email_verified: true,
        name: "RBAC Test 2 User",
        preferred_username: "11test2@yopmail.com",
        given_name: "RBAC Test 2",
        family_name: "User",
        email: "11test2@yopmail.com",
      },
    };

    var myquery = { _id: id };
    var newvalues = {name: "Mickey", address: "Canyon 123" } 

    if (user) {
      try {
        User.updateOne(myquery, newvalues).then(
          (data, err) => {
            if (err) res.status(StatusCodes.BAD_REQUEST).json({ err });
            else
              res.status(StatusCodes.OK).json({
                message: "User Update Successfully",
                status: ReasonPhrases.OK,
                statusCode: StatusCodes.OK,
                data: userInfo.data,
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
module.exports = { profile, updateUser,updateProfile };
