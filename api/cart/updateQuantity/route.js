import connectDB from "../../../lib/mongodb.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
import User from "../../../modules/User.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await authMiddleware(req, res);

    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    if (!productId || quantity < 1) {
      return res.status(400).json({ message: "Invalid productId or quantity" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (!cartItem) return res.status(404).json({ message: "Product not found in cart" });

    cartItem.quantity = quantity;
    await user.save();

    return res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (error) {
    return res.status(500).json({ message: "Error updating cart", error: error.message });
  }
}