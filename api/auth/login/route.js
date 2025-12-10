import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../../lib/mongodb.js";
import User from "../../modules/User.js";
import { runMiddleware, cors } from "@../../middleware/cors.js";

export default async function handler(req, res) {
   await runMiddleware(req, res, cors);
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // connect DB
    await connectDB();

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error logging in",
      error: error.message
    });
  }
}