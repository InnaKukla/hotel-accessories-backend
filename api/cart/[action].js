import connectDB from "../../lib/mongodb";
import User from "../../modules/User";
import authMiddleware from "../../middleware/auth";
import { runMiddleware, cors } from "../../middleware/cors";

export default async function handler(req, res) {
  // CORS
  await runMiddleware(req, res, cors);
  // Preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await authMiddleware(req, res);
  if (!user) return;

  const userId = req._user.userId;
  
  await connectDB();

  const body = req.body || {};

  
  const { action } = req.query; // <- ключова магія
  try {
    const dbUser = await User.findById(userId).populate("cart.product");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    switch (action) {
      case "list":
        return res.status(200).json({ cart: dbUser.cart });

      case "add": {
        const { productId, quantity } = body;
        const existing = dbUser.cart.find((i) => i.product.toString() === productId);

        if (existing) existing.quantity += quantity || 1;
        else dbUser.cart.push({ product: productId, quantity: quantity || 1 });

        await dbUser.save();
        return res.status(200).json({ message: "Added", cart: dbUser.cart });
      }

      case "update": {
        const { productId, quantity } = body;
        const item = dbUser.cart.find((i) => i.product.toString() === productId);

        if (!item)
          return res.status(404).json({ message: "Not found in cart" });

        item.quantity = quantity;
        await dbUser.save();
        return res.status(200).json({ message: "Updated", cart: dbUser.cart });
      }

      case "remove": {
        const { productId } = body;
        dbUser.cart = dbUser.cart.filter(
          (i) => i.product.toString() !== productId
        );
        await dbUser.save();
        return res.status(200).json({ message: "Removed", cart: dbUser.cart });
      }

      case "clear": {
        dbUser.cart = [];
        await dbUser.save();
        return res.status(200).json({ message: "Cleared", cart: dbUser.cart });
      }

      default:
        return res.status(400).json({ message: "Invalid action" });
    }
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
