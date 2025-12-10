import { runMiddleware, cors } from "../../middleware/cors.js";
import connectDB from "../../lib/mongodb.js";
import authMiddleware from "../../middleware/auth.js";
import User from "../../modules/User.js";

export default async function handler(req, res) {
   await runMiddleware(req, res, cors);
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();

    // Run auth middleware
    const userData = await authMiddleware(req, res);
    if (!userData) return; // Middleware already sent error response

    const userId = userData.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { token: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "You logged out" });

  } catch (error) {
    return res.status(500).json({
      message: "Error logging out",
      error: error.message,
    });
  }
}