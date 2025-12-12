import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../../lib/mongodb";
import User from "../../modules/User";
import authMiddleware from "../../middleware/auth";
import { runMiddleware, cors } from "../../middleware/cors";

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  const { action } = req.query;

  // Preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  await connectDB();

  try {
    switch (action) {

      // -------------------------------- REGISTER
      case "register": {
        if (req.method !== "POST")
          return res.status(405).json({ message: "Method not allowed" });

        const {
          companyName,
          firstName,
          lastName,
          phone,
          email,
          password,
          confirmPassword
        } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser)
          return res.status(400).json({ message: "User already exists" });

        if (password !== confirmPassword)
          return res.status(400).json({ message: "Passwords do not match" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
          companyName,
          firstName,
          lastName,
          phone,
          email,
          password: hashed
        });

        const token = jwt.sign(
          { userId: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return res.status(201).json({
          message: "User registered",
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
      }

      // -------------------------------- LOGIN
      case "login": {
        if (req.method !== "POST")
          return res.status(405).json({ message: "Method not allowed" });

        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
          return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res.status(400).json({ message: "Invalid credentials" });

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
      }

      // -------------------------------- LOGOUT
      case "logout": {
        if (req.method !== "POST")
          return res.status(405).json({ message: "Method not allowed" });

        const data = await authMiddleware(req, res);
        if (!data) return;

        await User.findByIdAndUpdate(data.userId, { token: null });

        return res.status(200).json({ message: "Logged out" });
      }

      // -------------------------------- UPDATE PROFILE
      case "update": {
        if (req.method !== "PUT")
          return res.status(405).json({ message: "Method not allowed" });

        const data = await authMiddleware(req, res);
        if (!data) return;

            // const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const {
          companyName,
          firstName,
          lastName,
          phone,
          password
        } = req.body;

        if (companyName) user.companyName = companyName;
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (phone) user.phone = phone;
        if (password) user.password = await bcrypt.hash(password, 10);

            await user.save();
            return res.status(200).json({ message: "User updated", user });
      }

      // -------------------------------- GET ONE USER
      case "user": {
        if (req.method !== "GET")
          return res.status(405).json({ message: "Method not allowed" });

        const userId = req.user.userId;

        const user = await User.findById(userId).select("-password");
        if (!user)
          return res.status(404).json({ message: "User not found" });

        return res.status(200).json(user);
      }

      // -------------------------------- INVALID ACTION
      default:
        return res.status(400).json({ message: "Invalid action" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}