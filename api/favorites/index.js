import connectDB from "../../../lib/mongodb";
import Favorite from "../../../models/Favorite";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";

async function handler(req, res) {
  await runMiddleware(req, res, cors);
  await connectDB();

  const method = req.method;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // ✅ GET all favorites
  if (method === "GET") {
    try {
      const favorites = await Favorite.find({ userId }).populate("productId");
      res.status(200).json(favorites.map(fav => fav.productId));
    } catch (error) {
      res.status(500).json({ message: "Error retrieving favorites", error: error.message });
    }
    return;
  }

  // ✅ POST add favorite
  if (method === "POST") {
    try {
      const { productId } = req.body;
      if (!productId) return res.status(400).json({ message: "productId is required" });

      const existing = await Favorite.findOne({ userId, productId });
      if (existing) return res.status(400).json({ message: "Product already in favorites" });

      const favorite = new Favorite({ userId, productId });
      await favorite.save();

      res.status(201).json({ message: "Product added to favorites", favorite });
    } catch (error) {
      res.status(500).json({ message: "Error adding to favorites", error: error.message });
    }
    return;
  }

  res.status(405).end();
}

export default authMiddleware(handler);