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

// ---------------- GET all products ----------------
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
    return new Response(
      JSON.stringify({ message: "Error fetching products", error: error.message }),
      { status: 500 }
    );
  }
}

// ---------------- GET one product ----------------
export async function GET_ONE(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const product = await Product.findById(params.id);
    if (!product)
      return new Response(JSON.stringify({ message: "Product not found" }), { status: 404 });

    return new Response(JSON.stringify(product), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Error fetching product", error: error.message }),
      { status: 500 }
    );
  }
}

// ---------------- GET products by category ----------------
export async function GET_CATEGORY(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();

  try {
    const { category } = params;
    const { searchParams } = new URL(req.url);
    let page = parseInt(searchParams.get("page")) || 1;
    let limit = parseInt(searchParams.get("limit")) || 8;

    if (!["bedding", "towels", "household-linens"].includes(category)) {
      return new Response(JSON.stringify({ message: "Invalid category" }), { status: 400 });
    }

    const totalProducts = await Product.countDocuments({ category });
    const products = await Product.find({ category })
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
    return new Response(
      JSON.stringify({ message: "Error fetching category", error: error.message }),
      { status: 500 }
    );
  }
}

// ---------------- POST new product ----------------
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
// ---------------- PATCH update product ----------------
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
      } catch (error) {
        resolve(new Response(JSON.stringify({ message: "Error updating product", error: error.message }), { status: 500 }));
      }
    });
  });
};

// ---------------- DELETE product ----------------
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
};