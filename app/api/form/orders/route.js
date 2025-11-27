import connectDB from "@/lib/mongodb";
import Order from "@/models/Order";
import authMiddleware from "@/middleware/auth-middleware";

export async function GET(req) {
  try {
    await connectDB();

    const nextReq = { headers: Object.fromEntries(req.headers), user: null };
    const nextRes = {};
    await new Promise(resolve => authMiddleware(nextReq, nextRes, resolve));

    const orders = await Order.find({ user: nextReq.user.userId });
    const total = orders.length;

    return Response.json({ orders, total }, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error fetching orders", error: error.message }, { status: 500 });
  }
}