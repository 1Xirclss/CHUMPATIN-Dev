import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Importación de módulos de rutas
import authRoutes from "./src/routes/authRoutes.js";
import salesRoutes from "./src/routes/salesRoutes.js";
import reportsRoutes from "./src/routes/reportsRoutes.js";
import settingsRoutes from "./src/routes/settingsRoutes.js";

const app = express();

app.set("trust proxy", 1);

// Limitador de peticiones (Rate Limiting)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas peticiones desde esta IP. Intenta de nuevo más tarde.",
  },
});

app.use("/api/", apiLimiter);

// Configuración de CORS
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.includes("localhost") || origin.includes("127.0.0.1")) {
        callback(null, true);
      } else {
        callback(null, true); // Permitir para desarrollo flexible de red local
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Montaje de rutas API
app.use("/api/auth", authRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/settings", settingsRoutes);

// Ruta de comprobación de salud del servidor
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "CHUMPATIN XXL Ticket Management API",
    event: "SENIOR SEND-OFF · PROMO 2026",
    timestamp: new Date(),
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error("❌ [Error Global]:", err.message);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Error interno del servidor" : err.message,
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

export default app;
