import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import authMiddleware from "@/middleware/auth-middleware";
import { runMiddleware, cors } from "@/middleware/withCors";

export async function GET(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { id } = params;
    const user = await User.findById(id).select("-password");
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching user", error: error.message }), { status: 500 });
  }
}