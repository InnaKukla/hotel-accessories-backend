// middleware/auth-middleware.js
import jwt from "jsonwebtoken";

export default function authMiddleware(handler) {
  // wrapper to check Authorization header then call handler(req,res)
  return async (req, res) => {
    try {
      const authHeader = req.headers.get ? req.headers.get("authorization") : req.headers["authorization"];
      if (!authHeader) return res.status(401).json({ message: "No token, authorization denied" });

      const token = authHeader.split(" ")[1];
      if (!token) return res.status(401).json({ message: "No token, authorization denied" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // attach user data to req — in Next.js Request object we can't mutate easily,
      // but we'll pass decoded to handler via req._user
      req._user = decoded;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}