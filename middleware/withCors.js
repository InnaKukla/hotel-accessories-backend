import Cors from "cors";

// Ініціалізуємо cors
export const cors = Cors({
  origin: ["https://hotel-accessories.netlify.app", "http://localhost:3000"], // твої фронтенд-домени
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Функція-обгортка для Vercel
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}