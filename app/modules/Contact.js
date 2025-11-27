const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true, // Додає createdAt і updatedAt
  }
);

const Contact = mongoose.model("Contact", contactSchema);

module.exports = Contact;
