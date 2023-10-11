// authMiddleware.js
const {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} = require("http-status-codes");
const sessionStore = require("../db/session");
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET; // Replace with your actual secret key

function authenticateToken(req, res, next) {
  try {
    const { authorization, session_id } = req.headers;
    if (!authorization) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Session Expired",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    } else if (!session_id) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Session Not Found",
        statusCode: StatusCodes.UNAUTHORIZED,
        status: ReasonPhrases.UNAUTHORIZED,
      });
    } else {
      const decodeduser = jwt.verify(authorization, secretKey);
      if (!decodeduser) {
        res.status(StatusCodes.FORBIDDEN).json({
          message: "Authorization Token is Not Valid",
          statusCode: StatusCodes.FORBIDDEN,
          status: ReasonPhrases.FORBIDDEN,
        });
      } else {
        sessionStore.get(session_id, async (error, session) => {
          if (error) {
            res.status(StatusCodes.UNAUTHORIZED).json({
              message: error.message,
              statusCode: StatusCodes.UNAUTHORIZED,
              status: ReasonPhrases.UNAUTHORIZED,
              cause: error,
            });
          } else if (!session) {
            res.status(StatusCodes.UNAUTHORIZED).json({
              message: "Session Expired",
              statusCode: StatusCodes.UNAUTHORIZED,
              status: ReasonPhrases.UNAUTHORIZED,
            });
          } else {
            next();
          }
        });
      }
    }

    // Proceed with the protected route logic
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      status: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
}

module.exports = authenticateToken;
