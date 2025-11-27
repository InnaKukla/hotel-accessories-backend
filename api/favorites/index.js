import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth-middleware";
import { runMiddleware, cors } from "../../middleware/withCors";
import Favorite from "../../models/Favorite";

export default async function handler(req, res) {
   await runMiddleware(req, res, cors);
  await connectDB();

  if (req.method === "GET") {
    await authMiddleware(req, res);

    const { userId } = req.user;

    try {
      const favorites = await Favorite.find({ userId }).populate("productId");

      return res.json(favorites.map((fav) => fav.productId));
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving favorites",
        error: error.message,
      });
    }
  }

  if (req.method === "POST") {
    try {
      const { productId, userId } = req.body;

      if (!userId || !productId) {
        return res.status(400).json({
          message: "userId and productId are required",
        });
      }

      const existingFavorite = await Favorite.findOne({ userId, productId });

      if (existingFavorite) {
        return res
          .status(400)
          .json({ message: "Product is already in favorites" });
      }

      const favorite = new Favorite({ userId, productId });
      await favorite.save();

      return res
        .status(201)
        .json({ message: "Product add to favorites", favorite });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error adding to favorites", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}