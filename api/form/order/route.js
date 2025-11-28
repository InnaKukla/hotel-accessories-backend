import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth";
import { runMiddleware, cors } from "../../../middleware/cors";
import Order from "../../../modules/Order";

export async function POST(req) {
    await runMiddleware(req, null, cors);
  try {
    await connectDB();

    const nextReq = { headers: Object.fromEntries(req.headers), user: null };
    const nextRes = {};
    await new Promise(resolve => authMiddleware(nextReq, nextRes, resolve));

    const {
      products,
      companyName,
      name,
      email,
      phone,
      address,
      comment,
      totalPrice
    } = await req.json();

    if (!products || products.length === 0 || !email || !phone || !totalPrice) {
      return Response.json({ message: "Please fill in the required fields." }, { status: 400 });
    }

    const order = new Order({
      user: nextReq.user.userId,
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

    return Response.json({ message: "Order successfully created!" }, { status: 201 });
  } catch (error) {
    return Response.json({ message: "Error submitting form", error: error.message }, { status: 500 });
  }
}