import connectDB from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import authMiddleware from "@/middleware/auth-middleware";
import { runMiddleware, cors } from "@/middleware/withCors";

export async function PUT(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const body = await req.json();
    const { companyName, firstName, lastName, phone, password } = body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    if (companyName) user.companyName = companyName;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    return new Response(JSON.stringify({ message: "User updated successfully", user }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error updating profile", error: error.message }), { status: 500 });
  }
}