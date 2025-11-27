import mongoose from "mongoose";

const catalogSchema = new mongoose.Schema({
  bedding: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // посилання на модель Product
  }],
  towels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
  householdLinens: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  }],
}, {
  timestamps: true,
});

const Catalog = mongoose.models.Catalog || mongoose.model("Catalog", catalogSchema);

export default Catalog;