import authMiddleware from "../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";
import User from "../../models/User";
import connectDB from "../../lib/mongodb";

export default authMiddleware(async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  if (req.method !== "POST") return res.status(405).end();

  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user.cart) user.cart = [];

  const cartItem = user.cart.find((item) => item.product.toString() === productId);
  if (cartItem) {
    cartItem.quantity += quantity || 1;
  } else {
    user.cart.push({ product: productId, quantity: quantity || 1 });
  }

  await user.save();
  res.status(200).json({ message: "Item added", cart: user.cart });
});