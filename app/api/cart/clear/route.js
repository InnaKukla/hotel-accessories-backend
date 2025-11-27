import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import authMiddleware from "@/middleware/auth-middleware";
import { runMiddleware, cors } from "@/middleware/withCors";

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