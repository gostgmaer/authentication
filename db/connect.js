const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;
const connectDB = (url) => {
  mongoose.set('debug', true);

  return mongoose.connect(url);
};



module.exports = connectDB;