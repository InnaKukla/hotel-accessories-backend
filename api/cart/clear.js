import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

async function handler(req, res) {
    await runMiddleware(req, res, cors);
  if (req.method !== "DELETE") return res.status(405).end();
  await connectDB();

  const userId = req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.cart = [];
  await user.save();
  res.status(200).json({ message: "Cart cleared", cart: user.cart });
}

export default authMiddleware(handler);