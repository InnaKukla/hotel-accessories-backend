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
  await connectDB();

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  try {
    switch (action) {
      // ---------------- Add product ----------------
      case "add":
        if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

        // для Cloudinary multer
        await new Promise((resolve, reject) => {
          upload.single("image")(req, {}, (err) => (err ? reject(err) : resolve()));
        });

        {
          const { code, name, description, price, size, color, category } = await req.json();
          const imageUrl = req.file ? req.file.path : "";

          const product = new Product({
            code, name, description, price, size, color, category, image: imageUrl,
          });

          await product.save();
          return new Response(JSON.stringify(product), { status: 201 });
        }

      // ---------------- Update product ----------------
      case "update":
        if (req.method !== "PATCH") return new Response("Method not allowed", { status: 405 });

        await new Promise((resolve, reject) => {
          upload.single("image")(req, {}, (err) => (err ? reject(err) : resolve()));
        });

        {
          const { id, ...updates } = await req.json();
          const product = await Product.findById(id);
          if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

          // оновлення зображення
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
          return new Response(JSON.stringify(product), { status: 200 });
        }

      // ---------------- Delete product ----------------
      case "delete":
        if (req.method !== "DELETE") return new Response("Method not allowed", { status: 405 });
        {
          const { id } = Object.fromEntries(new URL(req.url).searchParams);
          const product = await Product.findById(id);
          if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

          if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            await cloudinary.v2.uploader.destroy(`product_images/${publicId}`);
          }

          await Product.findByIdAndDelete(id);
          return new Response(JSON.stringify({ message: "Product and image deleted" }), { status: 200 });
        }

      // ---------------- Get single product ----------------
      case "one":
        if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
        {
          const { id } = Object.fromEntries(new URL(req.url).searchParams);
          const product = await Product.findById(id);
          if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

          return new Response(JSON.stringify(product), { status: 200 });
        }

      // ---------------- Get products by category ----------------
      case "category":
        if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
        {
          const { category, page = 1, limit = 8 } = Object.fromEntries(new URL(req.url).searchParams);
          const pageNum = parseInt(page);
          const limitNum = parseInt(limit);

          if (!["bedding", "towels", "household-linens"].includes(category)) {
            return new Response(JSON.stringify({ message: "Invalid category" }), { status: 400 });
          }

          const totalProducts = await Product.countDocuments({ category });
          const products = await Product.find({ category })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

          return new Response(JSON.stringify({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNum),
            currentPage: pageNum,
            products,
          }), { status: 200 });
        }

      // ---------------- Get all products ----------------
      case "list":
      default:
        if (req.method !== "GET") return new Response("Method not allowed", { status: 405 });
        {
          const { page = 1, limit = 8 } = Object.fromEntries(new URL(req.url).searchParams);
          const pageNum = parseInt(page);
          const limitNum = parseInt(limit);

          const totalProducts = await Product.countDocuments();
          const products = await Product.find()
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);

          return new Response(JSON.stringify({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limitNum),
            currentPage: pageNum,
            products,
          }), { status: 200 });
        }
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error handling products", error: error.message }), { status: 500 });
  }
}