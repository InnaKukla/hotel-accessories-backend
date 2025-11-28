
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { runMiddleware, cors } from "../../../middleware/cors";
import User from "../../../modules/User";
import connectDB from "../../../lib/mongodb";

export async function POST(req) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const body = await req.json();
    const { companyName, firstName, lastName, phone, email, password, confirmPassword } = body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return new Response(JSON.stringify({ message: "User already exists" }), { status: 400 });

    if (password !== confirmPassword) return new Response(JSON.stringify({ message: "Passwords do not match" }), { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ companyName, firstName, lastName, phone, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return new Response(JSON.stringify({
      message: "User registered successfully",
      token,
      user: { id: user._id, companyName, firstName, lastName, phone, email }
    }), { status: 201 });

  } catch (error) {
    return new Response(JSON.stringify({ message: "Error registering user", error: error.message }), { status: 500 });
  }
}