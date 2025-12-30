const session = require("express-session");
const { dbUrl } = require("../config/setting");
const mongoSessionStore = require("connect-mongodb-session")(session);


const sessionStore = new mongoSessionStore({
    uri: dbUrl,
    collection: "sessions",
  });


  module.exports = sessionStore;