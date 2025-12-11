import connectDB from "../../lib/mongodb";
import authMiddleware from "../../middleware/auth";
import { runMiddleware, cors } from "../../middleware/cors";
import Order from "../../modules/Order";
import Contact from "../../modules/Contact";

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  const { method } = req;
  const action = req.query.action;

  try {
    // CONTACT FORM: POST /api/form?action=contact
    if (method === "POST" && action === "contact") {
      const body = req.body;
      if (!body.email || !body.phone)
        return res.status(400).json({ message: "Required fields missing" });

      await Contact.create(body);

      return res.status(201).json({ message: "Contact request sent" });
    }

    // ORDER FORM: POST /api/form?action=order
    if (method === "POST" && action === "order") {
      await authMiddleware(req, res);

      const body = req.body;
      if (!body.products?.length || !body.totalPrice)
        return res.status(400).json({ message: "Required fields missing" });

      await Order.create({ ...body, user: req.user.userId });

      return res.status(201).json({ message: "Order created" });
    }

    // ORDER LIST: GET /api/form?action=orders
    if (method === "GET" && action === "orders") {
      const auth = await authMiddleware(res, req);
      if (!auth) return;

      const userId = auth.userId;

      const orders = await Order.find({ user: userId });
      return res.status(200).json({ total: orders.length, orders });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (e) {
    return res.status(500).json({ message: "Error", error: e.message });
  }
}
