import connectDB from "../../lib/mongodb";
import Favorite from "../../modules/Favorite";
import { runMiddleware, cors } from "../../middleware/cors";
import authMiddleware from "../../middleware/auth";

async function handler(req, res) {
  // CORS
  await runMiddleware(req, res, cors);

  // Preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  const auth = await authMiddleware(req, res, { skipHandler: true });
  if (!auth || !req._user?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req._user.userId;
  await connectDB();

  const { action } = req.query;
  try {
    switch (action) {
      // ---------------- GET ONE FAVORITE
      // GET /api/favorites?action=get-one&productId=xxx
      case "one": {
        const productId = req.query.id;
        if (!productId) {
          return res.status(400).json({ message: "productId is required" });
        }

        const favorite = await Favorite.findOne({ userId, productId }).populate(
          "productId"
        );

        if (!favorite) {
          return res.status(200).json({ isFavorite: false, product: null });
        }

        return res.status(200).json({
          isFavorite: true,
          product: favorite.productId,
        });
      }

      // ---------------- GET ALL FAVORITES
      // GET /api/favorites?action=get-all
      case "list": {
        const favorites = await Favorite.find({ userId }).populate("productId");

        return res.status(200).json(favorites.map((fav) => fav.productId));
      }

      // ---------------- ADD favorite
      case "add": {
        const { productId } = req.body;

        if (!productId) {
          return res.status(400).json({ message: "productId is required" });
        }

        const existing = await Favorite.findOne({ userId, productId });
        if (existing) {
          return res.status(400).json({ message: "Already added" });
        }

        const favorite = new Favorite({ userId, productId });
        await favorite.save();

        return res.status(201).json({ message: "Added", favorite });
      }

      // ---------------- REMOVE favorite
      case "remove": {
        const { productId } = req.body;

        if (!productId) {
          return res.status(400).json({ message: "productId is required" });
        }

        const removed = await Favorite.findOneAndDelete({ userId, productId });

        if (!removed) {
          return res.status(404).json({ message: "Not found" });
        }

        return res.status(200).json({ message: "Removed" });
      }

      default:
        return res.status(400).json({ message: "Invalid action" });
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Server error", error: error.message }),
      { status: 500 }
    );
  }
}
export default authMiddleware(handler);
