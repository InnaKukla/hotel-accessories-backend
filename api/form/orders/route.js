import connectDB from "../../../lib/mongodb.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
import Order from "../../../modules/Order.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Авторизація
    await authMiddleware(req, res);

    const orders = await Order.find({ user: req.user.userId });
    const total = orders.length;

    return res.status(200).json({ orders, total });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
}