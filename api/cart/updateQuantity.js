import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== "PUT") return res.status(405).end();
  await connectDB();

  const userId = req.user.userId;
  const { productId, quantity } = req.body;

  if (!productId || quantity < 1) return res.status(400).json({ message: "Invalid productId or quantity" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const cartItem = user.cart.find(item => item.product.toString() === productId);
  if (!cartItem) return res.status(404).json({ message: "Product not found in cart" });

  cartItem.quantity = quantity;
  await user.save();
  res.status(200).json({ message: "Cart updated", cart: user.cart });
}

export default authMiddleware(handler);