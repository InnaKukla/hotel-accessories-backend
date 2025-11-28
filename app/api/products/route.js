import connectDB from "@/app/lib/mongodb";
import authMiddleware from "@/app/middleware/auth";
import Product from "@/app/models/Product";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let page = parseInt(searchParams.get("page") || 1);
    let limit = parseInt(searchParams.get("limit") || 8);

    const totalProducts = await Product.countDocuments();
    const products = await Product.find()
      .skip((page - 1) * limit)
      .limit(limit);

    return Response.json({
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      products,
    }, { status: 200 });
  } catch (error) {
    return Response.json({ message: "Error fetching products", error: error.message }, { status: 500 });
  }
}