import connectDB from "../../../lib/mongodb.js";
import corsMiddleware from "../../../middleware/cors.js";
import Contact from "../../../modules/Contact.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  try {
    if (req.method === "POST") {
      const { companyName, email, phone, message } = req.body;

      if (!email || !phone) {
        return res.status(400).json({ message: "Please fill in the required fields." });
      }

      const contact = new Contact({ companyName, email, phone, message });
      await contact.save();

      return res.status(201).json({ message: "Your request has been sent!" });

    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error submitting form", error: error.message });
  }
}