import connectDB from "../../../lib/mongodb.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../../lib/cloudinary.js";
import Product from "../../../modules/Product.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "product_images",
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "_" + file.originalname,
  },
});
const upload = multer({ storage });

export default async function handler(req, res) {
  await corsMiddleware(req, res);
  await connectDB();

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      return res.status(200).json(product);
    }

    if (req.method === "PATCH") {
      await authMiddleware(req, res);

      return upload.single("image")(req, res, async (err) => {
        if (err) return res.status(500).json({ message: err.message });

        try {
          const updates = req.body;
          const product = await Product.findById(id);
          if (!product) return res.status(404).json({ message: "Product not found" });

          if (req.file && product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`product_images/${publicId}`);
            updates.image = req.file.path;
          }

          Object.assign(product, updates);
          await product.save();
          return res.status(200).json(product);
        } catch (error) {
          return res.status(500).json({ message: "Error updating product", error: error.message });
        }
      });
    }

    if (req.method === "DELETE") {
      await authMiddleware(req, res);

      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      if (product.image) {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`product_images/${publicId}`);
      }

      await Product.findByIdAndDelete(id);
      return res.status(200).json({ message: "Product and image deleted" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}