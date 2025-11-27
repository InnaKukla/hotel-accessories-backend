import connectDB from "../../../lib/mongodb";
import Order from "../../../models/Order";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

export default authMiddleware(async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  if (req.method !== "POST") return res.status(405).end();

  try {
    const {
      products,
      companyName,
      name,
      email,
      phone,
      address,
      comment,
      totalPrice,
    } = req.body;

    if (!products || products.length === 0 || !email || !phone || !totalPrice) {
      return res
        .status(400)
        .json({ message: "Please fill in the required fields." });
    }

    const order = new Order({
      user: req.user.userId,
      products,
      companyName,
      name,
      email,
      phone,
      address,
      comment,
      totalPrice,
    });

    await order.save();
    res.status(201).json({ message: "Order successfully created!" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting form", error: error.message });
  }
});