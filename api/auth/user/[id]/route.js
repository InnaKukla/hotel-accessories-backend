export const config = {
  runtime: "edge",
};

import connectDB from "../../../lib/mongodb.js";
import corsMiddleware from "../../../middleware/cors.js";
import authMiddleware from "../../../middleware/auth.js";
import User from "../../../modules/User.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await connectDB();

  // auth middleware → розшифровує токен і кладе userId в req.user
  const authError = await authMiddleware(req, res);
  if (authError) return; // якщо middleware вже відправив res

  try {
    const userId = req.query.id; // в Vercel id йде як query параметр
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching user",
      error: error.message
    });
  }
}