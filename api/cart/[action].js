import connectDB from "../../../lib/mongodb";
import authMiddleware from "../../../middleware/auth";
import { runMiddleware, cors } from "../../../middleware/cors";
import User from "../../../modules/User";

// ---------------- Add item to cart ----------------
export async function POST(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const { productId, quantity } = await req.json();

    const user = await User.findById(userId);
    if (!user.cart) user.cart = [];

    const cartItem = user.cart.find((item) => item.product.toString() === productId);
    if (cartItem) {
      cartItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();
    return new Response(JSON.stringify({ message: "Item added to cart", cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error adding to cart", error: error.message }), { status: 500 });
  }
}

// ---------------- Update quantity ----------------
export async function PUT(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const { productId, quantity } = await req.json();
    const userId = req.user.userId;

    if (!productId || quantity < 1) 
      return new Response(JSON.stringify({ message: "Invalid productId or quantity" }), { status: 404 });

    const user = await User.findById(userId);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    const cartItem = user.cart.find((item) => item.product.toString() === productId);
    if (!cartItem) return new Response(JSON.stringify({ message: "Product not found in cart" }), { status: 404 });

    cartItem.quantity = quantity;
    await user.save();

    return new Response(JSON.stringify({ message: "Cart updated", cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error updating cart", error: error.message }), { status: 500 });
  }
}

// ---------------- Get cart ----------------
export async function GET(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("cart.product");
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    return new Response(JSON.stringify({ cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error getting cart", error: error.message }), { status: 500 });
  }
}

// ---------------- Remove item ----------------
export async function DELETE(req, { params }) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const { productId } = params;

    const user = await User.findById(userId);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();

    return new Response(JSON.stringify({ message: "Product removed from cart", cart: user.cart }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error removing from cart", error: error.message }), { status: 500 });
  }
}

// ---------------- Clear cart ----------------
export async function CLEAR(req) {
  await runMiddleware(req, null, cors);
  await connectDB();
  await authMiddleware(req, null);

  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });

    user.cart = [];
    await user.save();

    return new Response(JSON.stringify({ message: "Cart cleared", cart: user.cart }), { status: 200 });
    } catch (error) {
    return new Response(JSON.stringify({ message: "Error clearing cart", error: error.message }), { status: 500 });
  }
}