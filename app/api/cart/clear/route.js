import connectDB from "@/app/lib/mongodb";
import authMiddleware from "@/app/middleware/auth";
import { runMiddleware, cors } from "@/app/middleware/cors";
import User from "@/app/modules/User";

export async function DELETE(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    user.cart = [];
    await user.save();
    return new Response(JSON.stringify({ message: "Cart cleared", cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error clearing cart" }), { status: 500 });
  }
}