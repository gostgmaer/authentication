const mongoose = require("mongoose");

const connectDB = (url) => {
  mongoose.set('debug', true);

  return mongoose.connect(url);
};



module.exports = connectDB;