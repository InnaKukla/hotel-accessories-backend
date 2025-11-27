import connectDB from "../../../lib/mongodb";
import Favorite from "../../../models/Favorite";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== "DELETE") return res.status(405).end();

  await connectDB();
  await authMiddleware(req, res);

  try {
    const { productId } = req.query;

    const favorite = await Favorite.findOneAndDelete({
      userId: req.user.userId,
      productId,
    });

    if (!favorite) {
      return res
        .status(404)
        .json({ message: "Product doesn't find in favorites" });
    }

    return res.status(200).json({ message: "Product delete from favorites" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting from favorites",
      error: error.message,
    });
  }
}
