import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

export default authMiddleware(async function handler(req, res) {
    await runMiddleware(req, res, cors);
  await connectDB();

  if (req.method !== "GET") return res.status(405).end();

  try {
    const orders = await Order.find({ user: req.user.userId });
    const total = orders.length;
    res.status(200).json({ orders, total });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders", error: error.message });
  }
});