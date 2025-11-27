import Product from "../../../models/Product";
import { upload } from "../../../lib/cloudinary";
import { runMiddleware, cors } from "../../middleware/withCors";

export const config = {
  api: {
    bodyParser: false, // щоб Multer міг працювати
  },
};

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);
  if (req.method !== "POST") return res.status(405).end();

  upload.single("image")(req, res, async (err) => {
    if (err) return res.status(500).json({ message: err.message });

    try {
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
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}