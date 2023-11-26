const mongoose = require("mongoose");

const connection = mongoose.createConnection(process.env.MONGO_URL);
const dynamicModel = connection.model('Tank');

module.exports = dynamicModel;
