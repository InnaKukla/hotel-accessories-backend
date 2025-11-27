import connectDB from "@/lib/mongodb";
import Favorite from "@/models/Favorite";
import authMiddleware from "@/middleware/auth-middleware";
import { runMiddleware, cors } from "@/middleware/withCors";

export async function GET(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { userId } = req.user;
    const favorites = await Favorite.find({ userId }).populate("productId");

    return new Response(JSON.stringify(favorites.map(fav => fav.productId)), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error retrieving favorites", error: error.message }), { status: 500 });
  }
}

export async function POST(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { productId } = await req.json();
    const { userId } = req.user;

    if (!productId) {
      return new Response(JSON.stringify({ message: "productId is required" }), { status: 400 });
    }

    const existingFavorite = await Favorite.findOne({ userId, productId });
    if (existingFavorite) {
      return new Response(JSON.stringify({ message: "Product is already in favorites" }), { status: 400 });
    }

    const favorite = new Favorite({ userId, productId });
    await favorite.save();

    return new Response(JSON.stringify({ message: "Product added to favorites", favorite }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error adding to favorites", error: error.message }), { status: 500 });
  }
}