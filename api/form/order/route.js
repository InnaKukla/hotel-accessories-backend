import connectDB from "../../../lib/mongodb.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
import Order from "../../../modules/Order.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Виконуємо авторизацію
    await authMiddleware(req, res);

    const {
      products,
      companyName,
      name,
      email,
      phone,
      address,
      comment,
      totalPrice
    } = req.body;

    if (!products || products.length === 0 || !email || !phone || !totalPrice) {
      return res.status(400).json({ message: "Please fill in the required fields." });
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

    return res.status(201).json({ message: "Order successfully created!" });

  } catch (error) {
    return res.status(500).json({ message: "Error submitting form", error: error.message });
  }
}