const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const User = require("../models/User");

// ✅ Додати товар до корзини

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { productId, quantity } = req.body;

    const user = await User.findById(userId);

    if (!user.cart) {
      user.cart = [];
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (cartItem) {
      cartItem.quantity += quantity || 1;
    } else {
      user.cart.push({ product: productId, quantity: quantity || 1 });
    }

    await user.save();

    res.status(200).json({ message: "Item added to cart", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// ✅ Оновити кількість товару в корзині

router.put("/updateQuantity", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { productId, quantity } = req.body;
    if (!productId || quantity < 1) {
      return res.status(404).json({ message: "Invalid productId or quantity" });
    }
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );
    if (!cartItem) return res.status(404).json({ message: "Product not found in cart" });
    cartItem.quantity = quantity;

    await user.save();

    res.status(200).json({ message: "Cart updated", cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error updating to cart" });
  }
});


// ✅ Отримати всі товари з корзини
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).populate("cart.product");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ cart: user.cart });
  } catch (error) {
    res.status(500).json({ message: "Error getting to cart" });
  }
});


// ✅ Видалити товар з корзини

router.delete("/remove/:productId", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      const { productId} = req.params;
     console.log(productId, "productId");
     
      const user = await User.findById(userId);
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      user.cart = user.cart.filter((item) => item.product.toString() !== productId)
  
      await user.save();
  
      res.status(200).json({ message: "Product remove from cart", cart: user.cart });
    } catch (error) {
      res.status(500).json({ message: "Error removing from cart" });
    }
  });

  // ✅ Щчистити корзину

  router.delete("/clear", authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
     
      const user = await User.findById(userId);
  
      if (!user) return res.status(404).json({ message: "User not found" });
  
      user.cart = [];
  
      await user.save();
  
      res.status(200).json({ message: "Cart cleared", cart: user.cart });
    } catch (error) {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

module.exports = router;