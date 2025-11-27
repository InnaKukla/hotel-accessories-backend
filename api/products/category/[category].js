import Product from "../../../models/Product";
import { runMiddleware, cors } from "../../../middleware/withCors";


export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== "GET") return res.status(405).end();

  const { category } = req.query;
  let { page = 1, limit = 8 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  try {
    const validCategories = ["bedding", "towels", "household-linens"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const totalProducts = await Product.countDocuments({ category });
    const products = await Product.find({ category }).skip((page - 1) * limit).limit(limit);

    res.status(200).json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}