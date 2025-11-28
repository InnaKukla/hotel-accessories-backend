import connectDB from "../../../lib/mongodb.js";
import corsMiddleware from "../../../middleware/cors.js";
import authMiddleware from "../../../middleware/auth.js";
import Favorite from "../../../modules/Favorite.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  const authError = await authMiddleware(req, res);
  if (authError) return; // якщо middleware вже відправив відповідь

  const { userId } = req.user;

  try {
    if (req.method === "GET") {
      const favorites = await Favorite.find({ userId }).populate("productId");
      return res.status(200).json(favorites.map(fav => fav.productId));

    } else if (req.method === "POST") {
      const { productId } = req.body; // Vercel автоматично парсить JSON через Express-like API
      if (!productId) return res.status(400).json({ message: "productId is required" });

      const existingFavorite = await Favorite.findOne({ userId, productId });
      if (existingFavorite) {
        return res.status(400).json({ message: "Product is already in favorites" });
      }

      const favorite = new Favorite({ userId, productId });
      await favorite.save();
      return res.status(201).json({ message: "Product added to favorites", favorite });

    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error handling favorites", error: error.message });
  }
}