
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
    const user = await User.findByIdAndUpdate(userId, { token: null }, { new: true });
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ message: "You logged out" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error logging out", error: error.message }), { status: 500 });
  }
}