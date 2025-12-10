import connectDB from "../../lib/mongodb.js";
import User from "../../modules/User.js";
import jwt from "jsonwebtoken";
import authMiddleware from "../../middleware/auth.js";
import { runMiddleware, cors } from "../../middleware/cors.js";

export default authMiddleware(async function handler(req, res) {
  await connectDB();

  // CORS
  await runMiddleware(req, res, cors);

  // AUTH
  const user = await authMiddleware(req);
  if (user instanceof Response) return user;

  const body = await req.json().catch(() => ({}));
  const userId = user.userId;
  const { action } = req.query; // <- ключова магія
  try {
    const dbUser = await User.findById(userId).populate("cart.product");
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    switch (action) {
      case "list":
        return res.status(200).json({ cart: user.cart });

      case "add": {
        const { productId, quantity } = body;
        const existing = user.cart.find(
          (i) => i.product.toString() === productId
        );

        if (existing) existing.quantity += quantity || 1;
        else user.cart.push({ product: productId, quantity: quantity || 1 });

        await user.save();
        return res.status(200).json({ message: "Added", cart: user.cart });
      }

      case "update": {
        const { productId, quantity } = body;
        const item = user.cart.find((i) => i.product.toString() === productId);

        if (!item)
          return res.status(404).json({ message: "Not found in cart" });

        item.quantity = quantity;
        await user.save();
        return res.status(200).json({ message: "Updated", cart: user.cart });
      }

      case "remove": {
        const { productId } = body;
        user.cart = user.cart.filter((i) => i.product.toString() !== productId);
        await user.save();
        return res.status(200).json({ message: "Removed", cart: user.cart });
      }

      case "clear": {
        user.cart = [];
        await user.save();
        return res.status(200).json({ message: "Cleared", cart: user.cart });
      }

      default:
        return res.status(400).json({ message: "Invalid action" });
    }
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
});
