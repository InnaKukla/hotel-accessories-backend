import connectDB from "@/app/lib/mongodb";
import authMiddleware from "@/app/middleware/auth";
import { runMiddleware, cors } from "@/app/middleware/cors";
import User from "@/app/modules/User";

export async function GET(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("cart.product");
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error getting cart" }), { status: 500 });
  }
}