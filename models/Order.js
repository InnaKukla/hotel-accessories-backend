const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        image: {type: String, required: true },
        code: { type: String, required: true },
        name: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: [String], required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    companyName: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    comment: { type: String, required: true },
    totalPrice: { type: Number, required: true },
  },
  {
    timestamps: true, // Додає createdAt та updatedAt
  }
);

module.exports = mongoose.model("Order", orderSchema);
