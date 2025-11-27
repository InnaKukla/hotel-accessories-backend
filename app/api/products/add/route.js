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

export async function GET(req) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    let page = parseInt(searchParams.get("page")) || 1;
    let limit = parseInt(searchParams.get("limit")) || 8;

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    return new Response(
      JSON.stringify({
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        products,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching products", error: error.message }), { status: 500 });
  }
}

// Для POST треба обгорнути multer і authMiddleware
export const POST = async (req, res) => {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  return new Promise((resolve) => {
    upload.single("image")(req, {}, async (err) => {
      if (err) return resolve(new Response(JSON.stringify({ message: err.message }), { status: 500 }));

      try {
        const { code, name, description, price, size, color, category } = req.body;
        const imageUrl = req.file ? req.file.path : "";

        const product = new Product({ code, name, description, price, size, color, category, image: imageUrl });
        await product.save();

        resolve(new Response(JSON.stringify(product), { status: 201 }));
      } catch (error) {
        resolve(new Response(JSON.stringify({ message: "Error creating product", error: error.message }), { status: 500 }));
      }
    });
  });
};