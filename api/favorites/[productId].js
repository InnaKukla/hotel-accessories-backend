// import connectDB from "../../../lib/mongodb";
// import Favorite from "../../../models/Favorite";
// import authMiddleware from "../../../middleware/auth-middleware";
// import { runMiddleware, cors } from "../../middleware/withCors";

// async function handler(req, res) {
//   await runMiddleware(req, res, cors);
//   if (req.method !== "GET") return res.status(405).end();

//   await connectDB();

//   const { productId } = req.query;
//   const { userId } = req.user;

//   try {
//     const favorite = await Favorite.findOne({ userId, productId }).populate(
//       "productId"
//     );

//     if (!favorite) {
//       return res.status(200).json({ isFavorite: false, product: null });
//     }

//     return res.status(200).json({
//       isFavorite: true,
//       product: favorite.productId,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "Error receiving product",
//       error: error.message,
//     });
//   }
// }
// export default authMiddleware(handler);

// app/api/cart/route.js
import connectDB from "../../../lib/mongodb";
import User from "../../models/User";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  // --- тимчасова заглушка ---
  const userId = "1234567890abcdef12345678"; // просто фейковий id

  try {
    // await connectDB(); // поки не підключаємо базу

    // Фейкові дані
    const cart = [
      { product: { name: "Product 1" }, quantity: 2 },
      { product: { name: "Product 2" }, quantity: 1 },
    ];

    return res.status(200).json({ cart });
  } catch {
    return res.status(500).json({ message: "Error getting to cart" });
  }
}