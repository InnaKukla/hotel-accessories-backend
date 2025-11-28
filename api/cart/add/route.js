import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth";
import { runMiddleware, cors } from "../../../middleware/cors";
import User from "../../../modules/User";

export async function POST(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const { productId, quantity } = await req.json();

    const user = await User.findById(userId);
    if (!user.cart) user.cart = [];

    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (cartItem) cartItem.quantity += quantity || 1;
    else user.cart.push({ product: productId, quantity: quantity || 1 });

    await user.save();
    return new Response(JSON.stringify({ message: "Item added to cart", cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error adding to cart" }), { status: 500 });
  }
}