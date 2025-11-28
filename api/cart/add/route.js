import connectDB from "../../../lib/mongodb.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
import User from "../../../modules/User.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Авторизація
    await authMiddleware(req, res);

    const userId = req.user.userId;
    const { productId, quantity } = req.body; // req.body замість req.json()

    const user = await User.findById(userId);
    if (!user.cart) user.cart = [];

    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (cartItem) {
      cartItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    return res.status(200).json({ message: "Item added to cart", cart: user.cart });
  } catch (error) {
    return res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
}