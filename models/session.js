const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const sessionSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
      trim: true,
      min: 3,
      max: 20,
    },
    lastName: {
      type: String,
      require: true,
      trim: true,
      min: 3,
      max: 20,
    },
    hash_password: {
      type: String,
      require: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    contactNumber: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
    },
  },
  { timestamps: true }
);
//For get fullName from when we get data from database
sessionSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});
sessionSchema.method({
  async authenticate(password) {
    return bcrypt.compare(password, this.hash_password);
  },
});
module.exports = mongoose.model("Sessions", sessionSchema);

