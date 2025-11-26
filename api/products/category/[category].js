import connectDB from "../../../lib/mongodb";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  await connectDB();
  const { category } = req.query;

  if (!["bedding", "towels", "household-linens"].includes(category)) {
    return res.status(400).json({ message: "Invalid category" });
  }

  if (req.method === "GET") {
    let { page = 1, limit = 8 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

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
    await Product.deleteMany({ category });
    return res.status(200).json({ message: `${category} category deleted `});
  }
}