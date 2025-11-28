import connectDB from "../../../lib/mongodb.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../../lib/cloudinary.js";
import authMiddleware from "../../../middleware/auth.js";
import corsMiddleware from "../../../middleware/cors.js";
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

  try {
    if (req.method === "GET") {
      const { searchParams } = new URL(req.url);
      let page = parseInt(searchParams.get("page")) || 1;
      let limit = parseInt(searchParams.get("limit")) || 8;

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
    }

    if (req.method === "POST") {
      await authMiddleware(req, res);

      return upload.single("image")(req, res, async (err) => {
        if (err) return res.status(500).json({ message: err.message });

        try {
          const { code, name, description, price, size, color, category } = req.body;
          const imageUrl = req.file ? req.file.path : "";

          const product = new Product({ code, name, description, price, size, color, category, image: imageUrl });
          await product.save();

          return res.status(201).json(product);
        } catch (error) {
          return res.status(500).json({ message: "Error creating product", error: error.message });
        }
      });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}