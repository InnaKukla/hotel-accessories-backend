import connectDB from "../../../lib/mongodb";
import Product from "../../../models/Product";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Налаштування Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "product_images",
    format: async () => "jpg",
    public_id: (req, file) => Date.now() + "_" + file.originalname,
  },
});

const upload = multer({ storage });

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    let { page = 1, limit = 8 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

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
    upload.single("image")(req, {}, async (err) => {
      if (err) return res.status(500).json({ message: err.message });

      try {
        const { code, name, description, price, size, color, category } =
          req.body;
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
      } catch (error) {
        return res
          .status(500)
          .json({ message: "Error creating product", error: error.message });
      }
    });
  }
}