export const config = {
  runtime: "edge",
};

import connectDB from "../../lib/mongodb.js";
import User from "../../modules/User.js";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  await connectDB();

  const { action } = req.query; // <- ключова магія

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // AUTH
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  const user = await User.findById(req.userId).populate("cart.product");
  if (!user) return res.status(404).json({ message: "User not found" });

  const body = req.body;

  switch (action) {

    case "list":
      return res.status(200).json({ cart: user.cart });

    case "add":
      {
        const { productId, quantity } = body;
        const existing = user.cart.find(i => i.product.toString() === productId);

        if (existing) existing.quantity += quantity || 1;
        else user.cart.push({ product: productId, quantity: quantity || 1 });

        await user.save();
        return res.status(200).json({ message: "Added", cart: user.cart });
      }

    case "update":
      {
        const { productId, quantity } = body;
        const item = user.cart.find(i => i.product.toString() === productId);

        if (!item) return res.status(404).json({ message: "Not found in cart" });

        item.quantity = quantity;
        await user.save();
        return res.status(200).json({ message: "Updated", cart: user.cart });
      }

    case "remove":
      {
        const { productId } = body;
        user.cart = user.cart.filter(i => i.product.toString() !== productId);
        await user.save();
        return res.status(200).json({ message: "Removed", cart: user.cart });
      }

    case "clear":
      {
        user.cart = [];
        await user.save();
        return res.status(200).json({ message: "Cleared", cart: user.cart });
      }

    default:
      return res.status(400).json({ message: "Invalid action" });
  }
}