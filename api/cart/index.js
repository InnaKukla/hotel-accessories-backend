// import connectDB from "../../../lib/mongodb";
// import authMiddleware from "../../../middleware/auth-middleware";
// import { runMiddleware, cors } from "../../middleware/withCors";
// import User from "../../models/User";

// async function handler(req, res) {
// await runMiddleware(req, res, cors);
//   if (req.method !== "GET") return res.status(405).end();

//   await connectDB();

//   try {
//     const userId = req.user.userId;

//     const user = await User.findById(userId).populate("cart.product");

//     if (!user) return res.status(404).json({ message: "User not found" });

//     return res.status(200).json({ cart: user.cart });
//   } catch {
//     return res.status(500).json({ message: "Error getting to cart" });
//   }
// }

// export default authMiddleware(handler);

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