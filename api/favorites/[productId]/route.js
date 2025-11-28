import connectDB from "../../../lib/mongodb.js";
import corsMiddleware from "../../../middleware/cors.js";
import authMiddleware from "../../../middleware/auth.js";
import Favorite from "../../../modules/Favorite.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);

  const { productId } = req.query; // [productId].js → Vercel передає як query
  if (!productId) return res.status(400).json({ message: "Product ID is required" });

  await connectDB();

  // auth middleware → розшифровує токен і кладе userId в req.user
  const authError = await authMiddleware(req, res);
  if (authError) return; // якщо middleware вже відправив res

  try {
    const { userId } = req.user;

    if (req.method === "GET") {
      const favorite = await Favorite.findOne({ userId, productId }).populate("productId");
      if (!favorite) {
        return res.status(200).json({ isFavorite: false, product: null });
      }
      return res.status(200).json({ isFavorite: true, product: favorite.productId });

    } else if (req.method === "DELETE") {
      const favorite = await Favorite.findOneAndDelete({ userId, productId });
      if (!favorite) {
        return res.status(404).json({ message: "Product not found in favorites" });
      }
      return res.status(200).json({ message: "Product removed from favorites" });

    } else {
      return res.status(405).json({ message: "Method not allowed" });
    }

  } catch (error) {
    return res.status(500).json({ message: "Error handling favorite", error: error.message });
  }
}