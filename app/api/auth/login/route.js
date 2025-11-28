
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "@/app/lib/mongodb";
import { runMiddleware, cors } from "@/app/middleware/cors";
import User from "@/app/modules/User";

export async function POST(req) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return new Response(JSON.stringify({ message: "Invalid credentials" }), { status: 400 });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return new Response(JSON.stringify({
      token,
      user: {
        id: user._id,
        companyName: user.companyName,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email
      }
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ message: "Error logging in", error: error.message }), { status: 500 });
  }
}