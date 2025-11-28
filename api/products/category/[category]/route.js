import connectDB from "../../../lib/mongodb.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
import Product from "../../../modules/Product.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  const validCategories = ["bedding", "towels", "household-linens"];

  try {
    if (req.method === "GET") {
      const { category } = req.query; // для Vercel params йдуть як query
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const { searchParams } = new URL(req.url);
      let page = parseInt(searchParams.get("page")) || 1;
      let limit = parseInt(searchParams.get("limit")) || 8;

      const totalProducts = await Product.countDocuments({ category });
      const products = await Product.find({ category })
        .skip((page - 1) * limit)
        .limit(limit);

      return res.status(200).json({
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        products,
      });
    }

    if (req.method === "DELETE") {
      await authMiddleware(req, res);

      const { category } = req.query;
      if (!validCategories.includes(category)) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const result = await Product.deleteMany({ category });

      return res.status(200).json({
        message: `${category} category deleted`,
        deletedCount: result.deletedCount,
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}