import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth";
import { runMiddleware, cors } from "../../../middleware/cors";
import Order from "../../../modules/Order";
import Contact from "../../../modules/Contact";

// POST /api/form/contact
export async function POST(req) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const { companyName, email, phone, message } = await req.json();

    if (!email || !phone) {
      return new Response(
        JSON.stringify({ message: "Please fill in the required fields." }),
        { status: 400 }
      );
    }

    const contact = new Contact({ companyName, email, phone, message });
    await contact.save();

    return new Response(JSON.stringify({ message: "Your request has been sent!" }), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error submitting form", error: error.message }),
      { status: 500 }
    );
  }
}

// POST /api/form/order
export async function ORDER(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

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
    } = await req.json();

    if (!products || products.length === 0 || !email || !phone || !totalPrice) {
      return new Response(
        JSON.stringify({ message: "Please fill in the required fields." }),
        { status: 400 }
      );
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
    return new Response(JSON.stringify({ message: "Order successfully created!" }), { status: 201 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error submitting form", error: error.message }),
      { status: 500 }
    );
  }
}

// GET /api/form/orders
export async function GET(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const orders = await Order.find({ user: req.user.userId });
    const total = orders.length;

    return new Response(JSON.stringify({ orders, total }), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching orders", error: error.message }),
      { status: 500 }
    );
  }
}