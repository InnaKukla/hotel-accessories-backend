const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  // console.log("Headers:", req.headers);

  const authHeader = req.headers["authorization"]; // Переконуємось, що пишемо все в нижньому регістрі
  console.log("Authorization header:", authHeader); // Логуємо значення

  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

const token = authHeader.split(" ")[1];
  // const token = req.header("Authorization");
  // console.log(token);
  
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;