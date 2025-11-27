import connectDB from "@/lib/mongodb";
import Contact from "@/models/Contact";
import { runMiddleware, cors } from "@/middleware/withCors";

export async function POST(req) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const { companyName, email, phone, message } = await req.json();

    if (!email || !phone) {
      return new Response(JSON.stringify({ message: "Please fill in the required fields." }), { status: 400 });
    }

    const contact = new Contact({ companyName, email, phone, message });
    await contact.save();

    return new Response(JSON.stringify({ message: "Your request has been sent!" }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error submitting form", error: error.message }), { status: 500 });
  }
}