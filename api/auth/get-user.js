import connectDB from "../../../lib/mongodb";
import User from "../../../models/User";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

export default authMiddleware(async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { id } = req.query;
    if (!id) return res.status(404).json({ message: "User id is required" });

    const user = await User.findById(id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user", error: error.message });
  }
});
