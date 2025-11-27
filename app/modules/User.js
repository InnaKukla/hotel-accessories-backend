const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, default: null },
    cart: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 }
    }],
    default: []
  
  },
  {
    timestamps: true, // Додає createdAt і updatedAt
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
