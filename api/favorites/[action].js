import connectDB from "../../lib/mongodb";
import jwt from "jsonwebtoken";
import Favorite from "../../modules/Favorite";

export default async function handler(req, res) {
  await connectDB();

  const { action } = req.query;

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // AUTH
  let userId;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  switch (action) {
    // ---------------- GET (check one or get all)
    case "get": {
      const productId = req.query.productId;
      if (productId) {
        const favorite = await Favorite.findOne({ userId, productId }).populate("productId");
        if (!favorite) return res.status(200).json({ isFavorite: false, product: null });

        return res.status(200).json({ isFavorite: true, product: favorite.productId });
      } else {
        const favorites = await Favorite.find({ userId }).populate("productId");
        return res.status(200).json(
          favorites.map(fav => fav.productId)
        );
      }
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
}