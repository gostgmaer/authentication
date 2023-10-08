const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = new mongoose.Schema(
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
    username: {
      type: String,
      require: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      require: true,
      trim: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    hash_password: {
      type: String,
      require: true,
    },
    resetToken: String,
    resetTokenExpiration: Date,
    confirmToken: String,
    isEmailconfirm: {
      type: Boolean,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    contactNumber: {
      type: String,
    },
    update_by: {
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
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});
userSchema.method({
  async authenticate(password) {
    return bcrypt.compare(password, this.hash_password);
  },
});
module.exports = mongoose.model("User", userSchema);
