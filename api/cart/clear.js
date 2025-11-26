import authMiddleware from "../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";
import User from "../../models/User";
import connectDB from "../../lib/mongodb";

export default authMiddleware(async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  if (req.method !== "DELETE") return res.status(405).end();

  const userId = req.user.userId;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.cart = [];
  await user.save();

  res.status(200).json({ message: "Cart cleared", cart: user.cart });
});