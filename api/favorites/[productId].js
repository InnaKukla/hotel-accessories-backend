import connectDB from "../../../lib/mongodb";
import Favorite from "../../../models/Favorite";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  const { productId } = req.query;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  if (req.method === "GET") {
    try {
      const favorite = await Favorite.findOne({ userId, productId }).populate("productId");
      if (!favorite) return res.status(200).json({ isFavorite: false, product: null });
      res.status(200).json({ isFavorite: true, product: favorite.productId });
    } catch (error) {
      res.status(500).json({ message: "Error retrieving favorite", error: error.message });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      const deleted = await Favorite.findOneAndDelete({ userId, productId });
      if (!deleted) return res.status(404).json({ message: "Product not found in favorites" });
      res.status(200).json({ message: "Product removed from favorites" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting favorite", error: error.message });
    }
    return;
  }

  res.status(405).end();
}

export default authMiddleware(handler);