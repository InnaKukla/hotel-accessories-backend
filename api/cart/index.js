import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  await connectDB();

  const userId = req.user.userId;
  const user = await User.findById(userId).populate("cart.product");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json({ cart: user.cart });
}

export default authMiddleware(handler);