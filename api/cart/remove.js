import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";
import User from "../../models/User";


export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== "DELETE") return res.status(405).end();

  await connectDB();
  await authMiddleware(req, res);

  try {
    const userId = req.user.userId;

    const { productId } = req.query;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    return res.status(200).json({ message: "Product remove from cart", cart: user.cart });
  } catch {
    return res.status(500).json({ message: "Error removing from cart" });
  }
}