export const config = {
  runtime: "edge",
};
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../../modules/User.js";
import connectDB from "../../../lib/mongodb.js";
import corsMiddleware from "../../../middleware/cors.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  try {
    const {
      companyName,
      firstName,
      lastName,
      phone,
      email,
      password,
      confirmPassword
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Password compare
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      companyName,
      firstName,
      lastName,
      phone,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        companyName,
        firstName,
        lastName,
        phone,
        email
      }
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error registering user",
      error: error.message
    });
  }
}