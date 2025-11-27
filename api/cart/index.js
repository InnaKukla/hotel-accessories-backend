import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";
import User from "../../models/User";

async function handler(req, res) {
await runMiddleware(req, res, cors);
  if (req.method !== "GET") return res.status(405).end();

  await connectDB();

  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate("cart.product");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ cart: user.cart });
  } catch {
    return res.status(500).json({ message: "Error getting to cart" });
  }
}

export default authMiddleware(handler);