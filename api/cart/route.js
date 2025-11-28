import connectDB from "../../../lib/mongodb.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
import User from "../../../modules/User.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await authMiddleware(req, res);

    const userId = req.user.userId;
    const user = await User.findById(userId).populate("cart.product");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ cart: user.cart });
  } catch (error) {
    return res.status(500).json({ message: "Error getting cart", error: error.message });
  }
}