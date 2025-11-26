

import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";
import authMiddleware from "../../../middleware/auth-middleware";

async function handler(req, res) {
  await connectDB();

  if (req.method !== "GET") return res.status(405).end();

  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const orders = await Order.find({ user: userId });
    res.status(200).json({ orders, total: orders.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
}

export default authMiddleware(handler);