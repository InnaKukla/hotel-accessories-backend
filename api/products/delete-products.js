import Product from "../../models/Product";
import cloudinary from "../../../lib/cloudinary";
import { runMiddleware, cors } from "../../middleware/withCors";

export default async function handler(req, res) {
await runMiddleware(req, res, cors);
  if (req.method !== "DELETE") return res.status(405).end();

  try {
    const { id } = req.query;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product_images/${publicId}`);
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}