import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import authMiddleware from "../../../middleware/auth-middleware";

async function handler(req, res) {
  if (req.method !== "PUT") return res.status(405).end();
  await connectDB();

  const userId = req.user.userId;
  const { companyName, firstName, lastName, phone, password } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (companyName) user.companyName = companyName;
  if (firstName) user.firstName = firstName;
  if (lastName) user.lastName = lastName;
  if (phone) user.phone = phone;
  if (password) user.password = await bcrypt.hash(password, 10);

  await user.save();
  res.status(200).json({ message: "User updated successfully", user });
}

export default authMiddleware(handler);