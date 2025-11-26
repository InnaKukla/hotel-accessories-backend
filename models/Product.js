const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    color: {
      type: [String],
      required: true,
    },
    category: {
      type: String,
      enum: ["bedding", "towels", "household-linens"], // Обмежуємо категорії
      required: true,
    },
    image: {
      type: String,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Додає createdAt та updatedAt
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
