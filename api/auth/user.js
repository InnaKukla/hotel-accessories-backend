import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

async function handler(req, res) {
   await runMiddleware(req, res, cors);
  if (req.method !== "GET") return res.status(405).end();
  await connectDB();

  const user = await User.findById(req.query.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
}

export default authMiddleware(handler);