import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";
import User from "../../models/User";

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") return res.status(405).end();

  await connectDB();
  await authMiddleware(req, res);

  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    const user = await User.findById(userId);

    if (!user.cart) user.cart = [];

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (cartItem) {
      cartItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();

    return res.status(200).json({ message: "Item added to cart", cart: user.cart });
  } catch {
    return res.status(500).json({ message: "Error adding to cart" });
  }
}