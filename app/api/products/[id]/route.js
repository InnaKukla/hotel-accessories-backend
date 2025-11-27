import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import { runMiddleware, cors } from "@/middleware/withCors";
import authMiddleware from "@/middleware/auth-middleware";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "@/lib/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "product_images",
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "_" + file.originalname,
  },
});
const upload = multer({ storage });

export async function GET(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const product = await Product.findById(params.id);
    if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });
    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching product", error: error.message }), { status: 500 });
  }
}

export const PATCH = async (req, { params }) => {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  return new Promise((resolve) => {
    upload.single("image")(req, {}, async (err) => {
      if (err) return resolve(new Response(JSON.stringify({ message: err.message }), { status: 500 }));

      try {
        const updates = req.body;
        const product = await Product.findById(params.id);
        if (!product) return resolve(new Response(JSON.stringify({ message: "Product not found" }), { status: 404 }));

        // Якщо нове зображення, видаляємо старе
        if (req.file && product.image) {
          const publicId = product.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`product_images/${publicId}`);
          updates.image = req.file.path;
        }

        Object.assign(product, updates);
        await product.save();
        resolve(new Response(JSON.stringify(product), { status: 200 }));
      } catch (error) {
        resolve(new Response(JSON.stringify({ message: "Error updating product", error: error.message }), { status: 500 }));
      }
    });
  });
};

export async function DELETE(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const product = await Product.findById(params.id);
    if (!product) return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product_images/${publicId}`);
    }

    await Product.findByIdAndDelete(params.id);
    return new Response(JSON.stringify({ message: "Product and image deleted" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error deleting product", error: error.message }), { status: 500 });
  }
}