// middleware/auth.js
import jwt from "jsonwebtoken";

export default async function authMiddleware(req, res) {
  // wrapper: перевіряє токен і викликає handler(req, res)

    try {
      const authHeader = req.headers["authorization"];
      if (!authHeader) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req._user = decoded; // додаємо дані користувача до req
      return decoded; // викликаємо оригінальний handler
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized", error: err.message });
    }
  };
