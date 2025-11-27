import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, default: null },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Уникаємо помилок при повторному імпорті у Next.js
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;