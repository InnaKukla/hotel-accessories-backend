import connectDB from "@/app/lib/mongodb";
import authMiddleware from "@/app/middleware/auth";
import { runMiddleware, cors } from "@/app/middleware/cors";
import Favorite from "@/app/modules/Favorite";


export async function GET(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { productId } = params;
    const { userId } = req.user;

    const favorite = await Favorite.findOne({ userId, productId }).populate("productId");
    if (!favorite) return new Response(JSON.stringify({ isFavorite: false, product: null }), { status: 200 });

    return new Response(JSON.stringify({ isFavorite: true, product: favorite.productId }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error fetching product", error: error.message }), { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { productId } = params;
    const { userId } = req.user;

    const favorite = await Favorite.findOneAndDelete({ userId, productId });
    if (!favorite) return new Response(JSON.stringify({ message: "Product not found in favorites" }), { status: 404 });

    return new Response(JSON.stringify({ message: "Product removed from favorites" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error deleting favorite", error: error.message }), { status: 500 });
  }
}