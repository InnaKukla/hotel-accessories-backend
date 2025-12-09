import connectDB from "../../../lib/mongodb";
import { runMiddleware, cors } from "../../../middleware/cors";
import authMiddleware from "../../../middleware/auth";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../../../lib/cloudinary";
import Product from "../../../modules/Product";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "product_images",
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "_" + file.originalname,
  },
});
const upload = multer({ storage });

// ---------------- handler ----------------
export async function handler(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();

  const { action } = params;

  try {
    switch (action) {
      case "create": {
        await authMiddleware(req, null);
        return new Promise((resolve) => {
          upload.single("image")(req, {}, async (err) => {
            if (err) return resolve(new Response(JSON.stringify({ message: err.message }), { status: 500 }));

            const { code, name, description, price, size, color, category } = req.body;
            const imageUrl = req.file ? req.file.path : "";

            const product = new Product({ code, name, description, price, size, color, category, image: imageUrl });
            await product.save();
            resolve(new Response(JSON.stringify(product), { status: 201 }));
          });
        });
      }

      case "update": {
        await authMiddleware(req, null);
        return new Promise((resolve) => {
          upload.single("image")(req, {}, async (err) => {
            if (err) return resolve(new Response(JSON.stringify({ message: err.message }), { status: 500 }));

            const { id, ...updates } = req.body;
            const product = await Product.findById(id);
            if (!product) return resolve(new Response(JSON.stringify({ message: "Product not found" }), { status: 404 }));

            let imageUrl = product.image;
            if (req.file) {
              if (imageUrl) {
                const publicId = imageUrl.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(`product_images/${publicId}`);
              }
              imageUrl = req.file.path;
            }

            Object.assign(product, updates, { image: imageUrl });
            await product.save();
            resolve(new Response(JSON.stringify(product), { status: 200 }));
          });
        });
      }

      case "delete": {
        await authMiddleware(req, null);
        const { id } = await req.json();
        const product = await Product.findById(id);
        if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

        if (product.image) {
          const publicId = product.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`product_images/${publicId}`);
        }

        await Product.findByIdAndDelete(id);
        return new Response(JSON.stringify({ message: "Product and image deleted" }), { status: 200 });
      }

      case "get": {
        const { id } = await req.json();
        const product = await Product.findById(id);
        if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });
        return new Response(JSON.stringify(product), { status: 200 });
      }

      case "category": {
        const { category } = await req.json();
        let { page = 1, limit = 8 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        if (!["bedding", "towels", "household-linens"].includes(category)) {
          return new Response(JSON.stringify({ message: "Invalid category" }), { status: 400 });
        }

        const totalProducts = await Product.countDocuments({ category });
        const products = await Product.find({ category }).skip((page - 1) * limit).limit(limit);

        return new Response(
          JSON.stringify({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products,
          }),
          { status: 200 }
        );
      }

      default: {
        let { page = 1, limit = 8 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);

        const totalProducts = await Product.countDocuments();
        const products = await Product.find().skip((page - 1) * limit).limit(limit);

        return new Response(
          JSON.stringify({
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            products,
          }),
          { status: 200 }
        );
      }
    }
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error handling products", error: error.message }), { status: 500 });
  }
}