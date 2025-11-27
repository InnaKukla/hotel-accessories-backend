import connectDB from "../../../lib/mongodb";
import Contact from "../../../models/Contact";
import { runMiddleware, cors } from "../../middleware/withCors";

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  if (req.method !== "POST") return res.status(405).end();

  try {
    const { companyName, email, phone, message } = req.body;

    if (!email || !phone) {
      return res
        .status(400)
        .json({ message: "Please fill in the required fields." });
    }

    const contact = new Contact({ companyName, email, phone, message });
    await contact.save();

    res.status(201).json({ message: "Your request has been sent!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting form", error: error.message });
  }
}
