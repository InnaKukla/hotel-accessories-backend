import Product from "../../models/Product";
import { upload, default as cloudinary } from "../../../lib/cloudinary";
import { runMiddleware, cors } from "../../middleware/withCors";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
    await runMiddleware(req, res, cors);
  if (req.method !== "PATCH") return res.status(405).end();

  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
      const { id } = req.query;
      const updates = req.body;
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      // Якщо нове зображення
      if (req.file) {
        if (product.image) {
          const publicId = product.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`product_images/${publicId}`);
        }
        updates.image = req.file.path;
      }

      Object.assign(product, updates);
      await product.save();
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}