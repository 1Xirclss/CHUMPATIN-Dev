import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  db: {
    URI: process.env.DB_URI || "mongodb://127.0.0.1:27017/chumpatin_db",
  },
  jwt: {
    secret: process.env.JWT_SECRET_KEY || "Marco123",
  },
  email: {
    user: process.env.USER_EMAIL || "mam270508@gmail.com",
    password: process.env.USER_PASSWORD || "jxvumfclfloqzzgi",
  },
  mailjet: {
    apiKey: process.env.API_KEY_MAILJET || "",
    secretKey: process.env.API_SECRET_MAILJET || "",
    fromEmail: process.env.MAILJET_FROM_EMAIL || "mam270508@gmail.com",
    fromName: process.env.MAILJET_FROM_NAME || "CHUMPATIN Oficial",
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "marcoale",
    apiKey: process.env.CLOUDINARY_API_KEY || "353813691619975",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "Be9nniq7JtEkheQbfDmKfu4XZUc",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};
