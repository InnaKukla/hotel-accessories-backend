import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import authMiddleware from "@/middleware/auth-middleware";
import { runMiddleware, cors } from "@/middleware/withCors";

export async function PUT(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { productId, quantity } = await req.json();
    const userId = req.user.userId;

    if (!productId || quantity < 1) return new Response(JSON.stringify({ message: "Invalid productId or quantity" }), { status: 404 });

    const user = await User.findById(userId);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    const cartItem = user.cart.find(item => item.product.toString() === productId);
    if (!cartItem) return new Response(JSON.stringify({ message: "Product not found in cart" }), { status: 404 });

    cartItem.quantity = quantity;
    await user.save();

    return new Response(JSON.stringify({ message: "Cart updated", cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error updating cart" }), { status: 500 });
  }
}