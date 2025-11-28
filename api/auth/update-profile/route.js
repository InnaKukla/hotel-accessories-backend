import bcrypt from "bcryptjs";
import connectDB from "../../../lib/mongodb.js";
import corsMiddleware from "../../../middleware/cors.js";
import authMiddleware from "../../../middleware/auth.js";
import User from "../../../modules/User.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  // auth middleware → розшифровує токен і кладе userId в req.user
  const authError = await authMiddleware(req, res);
  if (authError) return; // якщо там вже відправлено res — просто стоп

  try {
    const {
      companyName,
      firstName,
      lastName,
      phone,
      password
    } = req.body;

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (companyName) user.companyName = companyName;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return res.status(200).json({
      message: "User updated successfully",
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error updating profile",
      error: error.message
    });
  }
}