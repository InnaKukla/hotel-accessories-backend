const mongoose = require("mongoose");

const catalogSchema = new mongoose.Schema({
  bedding: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",  // посилання на модель Product
  }],
  towels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",  // посилання на модель Product
  }],
  householdLinens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",  // посилання на модель Product
  }],
}, {
  timestamps: true,  // Додає createdAt і updatedAt
});

const Catalog = mongoose.model("Catalog", catalogSchema);

module.exports = Catalog;