const express = require("express");
const cors = require("cors");

const app = express();

// Дозволяємо фронтенду робити запити
app.use(
  cors({
    origin: [
      "https://hotel-accessories.netlify.app/", // продакшн фронт
      "http://localhost:3000",                  // локальний React
      "http://localhost:3001"                   // твій локальний порт, якщо він інший
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// JSON body parser
app.use(express.json());

// Підключаємо маршрути
app.use("/api/auth", require("./API/AUTH/auth"));
app.use("/api/cart", require("./API/CART/cart"));
app.use("/api/favorites", require("./API/FAVORITES/favorites"));
app.use("/api/form", require("./API/FORM/form"));
app.use("/api/products", require("./API/PRODUCTS/products"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));