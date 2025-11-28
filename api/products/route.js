import connectDB from "../../../lib/mongodb.js";
import Product from "../../../modules/Product.js";
import corsMiddleware from "../../../middleware/cors.js";

export default async function handler(req, res) {
  await corsMiddleware(req, res);

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let page = parseInt(searchParams.get("page") || "1");
    let limit = parseInt(searchParams.get("limit") || "8");

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching products", error: error.message });
  }
}