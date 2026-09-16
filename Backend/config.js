import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  db: {
    URI: process.env.DB_URI || "mongodb://Cris:1234@ac-wp7enmg-shard-00-00.gwcqbvw.mongodb.net:27017,ac-wp7enmg-shard-00-01.gwcqbvw.mongodb.net:27017,ac-wp7enmg-shard-00-02.gwcqbvw.mongodb.net:27017/ChumpatinXXL?ssl=true&replicaSet=atlas-tfx964-shard-0&authSource=admin&appName=BasesDatosCristian",
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
  frontendUrl: process.env.FRONTEND_URL || "https://chumpatin-dev.vercel.app",
};
