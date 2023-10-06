const mongoose = require("mongoose");
const contactSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      require: true,
      trim: true,
      min: 2,
      max: 100,
    },
    lastName: {
      type: String,
      require: true,
      trim: true,
      min: 2,
      max: 100,
    },
    email: {
      type: String,
      require: true,
      trim: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
    },
    user_id: {
      type: String,
    },
    update_by: {
      type: String,
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    message: {
      type: String,
      maxlength: 100000, // Adjust the maximum length as needed
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      // Add other social media fields as needed
    },
  },
  { timestamps: true }
);
//For get fullName from when we get data from database
contactSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model("Contacts", contactSchema);
