import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

async function handler(req, res) {
   await runMiddleware(req, res, cors);
  if (req.method !== "POST") return res.status(405).end();
  await connectDB();

  const user = await User.findById(req.user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // тут можна очищати токен на фронті, бо serverless не зберігає сесію
  res.status(200).json({ message: "Logged out successfully" });
}

export default authMiddleware(handler);