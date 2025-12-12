import connectDB from "../../lib/mongodb";
import Product from "../../modules/Product";
import multer from "multer";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { runMiddleware, cors } from "../../middleware/cors";

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "product_images",
    format: async (req, file) => "jpg",
    public_id: (req, file) => Date.now() + "_" + file.originalname,
  },
});
const upload = multer({ storage });

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  // Preflight
  if (req.method === "OPTIONS") return res.status(204).end();
  await connectDB();

  const { action } = req.query;

  try {
    switch (action) {
      // ---------------- Add product ----------------
      case "add":
        if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

        await new Promise((resolve, reject) => {
          upload.single("image")(req, res, (err) => (err ? reject(err) : resolve()));
        });

        {
          const { code, name, description, price, size, color, category } = req.body;
          const imageUrl = req.file ? req.file.path : "";

          const product = new Product({
            code,
            name,
            description,
            price,
            size,
            color,
            category,
            image: imageUrl,
          });

          await product.save();
          return res.status(201).json(product);
        }

      // ---------------- Update product ----------------
      case "update":
        if (req.method !== "PATCH") return res.status(405).json({ message: "Method not allowed" });

        await new Promise((resolve, reject) => {
          upload.single("image")(req, res, (err) => (err ? reject(err) : resolve()));
        });

        {
          const { id, ...updates } = req.body;
          const product = await Product.findById(id);
          if (!product) return res.status(404).json({ message: "Product not found" });

          let imageUrl = product.image;
          if (req.file) {
            if (imageUrl) {
              const publicId = imageUrl.split("/").pop().split(".")[0];
              await cloudinary.v2.uploader.destroy(`product_images/${publicId}`);
            }
            imageUrl = req.file.path;
          }

          Object.assign(product, updates, { image: imageUrl });
          await product.save();
          return res.status(200).json(product);
        }

      // ---------------- Delete product ----------------
      case "delete":
        if (req.method !== "DELETE") return res.status(405).json({ message: "Method not allowed" });

        {
          const { id } = req.query;
          const product = await Product.findById(id);
          if (!product) return res.status(404).json({ message: "Product not found" });

          if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            await cloudinary.v2.uploader.destroy(`product_images/${publicId}`);
          }

          await Product.findByIdAndDelete(id);
          return res.status(200).json({ message: "Product and image deleted" });
        }

      // ---------------- Get single product ----------------
      case "one":
        if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

        {
          const { id } = req.query;
          const product = await Product.findById(id);
          if (!product) return res.status(404).json({ message: "Product not found" });
          return res.status(200).json(product);
        }

     // ---------------- Get products by category ----------------
      case "category":
        if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

        {
          const {category, page = 1, limit = 8 } = req.query;
          const pageNum = parseInt(page);
          const limitNum = parseInt(limit);

          if (!["bedding", "towels", "household-linens"].includes(category)) {
            return res.status(400).json({ message: "Invalid category" });
          }

          const totalProducts = await Product.countDocuments({ category });
          const products = await Product.find({ category })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

          return res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNum),
            currentPage: pageNum,
            products,
          });
        }

      // ---------------- Get all products ----------------
      case "list":
      default:
        if (req.method !== "GET") return res.status(405).json({ message: "Method not allowed" });

        {
          const { page = 1, limit = 8 } = req.query;
          const pageNum = parseInt(page);
          const limitNum = parseInt(limit);

          const totalProducts = await Product.countDocuments();
          const products = await Product.find()
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

          return res.status(200).json({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNum),
            currentPage: pageNum,
            products,
          });
        }
    }
  } catch (error) {
    return res.status(500).json({ message: "Error handling products", error: error.message });
  }
}