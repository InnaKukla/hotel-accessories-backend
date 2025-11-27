import Product from "../../../models/Product";
import { runMiddleware, cors } from "../../middleware/withCors";

export default async function handler(req, res) {
await runMiddleware(req, res, cors);
  if (req.method !== "GET") return res.status(405).end();

  try {
    const { id } = req.query;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}