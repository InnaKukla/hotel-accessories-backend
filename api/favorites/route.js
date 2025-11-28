import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth";
import { runMiddleware, cors } from "../../../middleware/cors";
import Favorite from "../../../modules/Favorite";

export async function GET(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const { userId } = req.user;

    if (productId) {
      // Перевірка конкретного продукту
      const favorite = await Favorite.findOne({ userId, productId }).populate("productId");
      if (!favorite) return new Response(JSON.stringify({ isFavorite: false, product: null }), { status: 200 });
      return new Response(JSON.stringify({ isFavorite: true, product: favorite.productId }), { status: 200 });
    } else {
      // Повернути всі улюблені товари користувача
      const favorites = await Favorite.find({ userId }).populate("productId");
      return new Response(JSON.stringify(favorites.map(fav => fav.productId)), { status: 200 });
    }
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

export async function DELETE(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const { userId } = req.user;

    if (!productId) {
      return new Response(JSON.stringify({ message: "productId is required" }), { status: 400 });
    }

    const favorite = await Favorite.findOneAndDelete({ userId, productId });
    if (!favorite) return new Response(JSON.stringify({ message: "Product not found in favorites" }), { status: 404 });

    return new Response(JSON.stringify({ message: "Product removed from favorites" }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error deleting favorite", error: error.message }), { status: 500 });
  }
}