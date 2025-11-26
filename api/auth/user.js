import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";

async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  await connectDB();

  const user = await User.findById(req.query.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });

  res.status(200).json(user);
}

export default authMiddleware(handler);