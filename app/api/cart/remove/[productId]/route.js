import connectDB from "@/app/lib/mongodb";
import authMiddleware from "@/app/middleware/auth";
import { runMiddleware, cors } from "@/app/middleware/cors";
import User from "@/app/modules/User";

export async function DELETE(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const { productId } = params;

    const user = await User.findById(userId);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();

    return new Response(JSON.stringify({ message: "Product removed from cart", cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error removing from cart" }), { status: 500 });
  }
}