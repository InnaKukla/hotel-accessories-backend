import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";

async function handler(req, res) {
  await connectDB();
  if (req.method !== "POST") return res.status(405).end();

  try {
    const id = req.user.userId;
    const user = await User.findByIdAndUpdate(id, { token: null }, { new: true });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "You logout" });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};
export default authMiddleware(handler);