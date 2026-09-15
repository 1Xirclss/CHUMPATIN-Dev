import mongoose from "mongoose";
import { config } from "./config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.db.URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("⚡ [MongoDB] Conectado exitosamente a la base de datos:", mongoose.connection.name);
  } catch (error) {
    console.error("❌ [MongoDB] Error de conexión inicial:", error.message);
    console.log("⏳ Reintentando conexión en 5 segundos...");
    setTimeout(connectDB, 5000);
  }
};

const connection = mongoose.connection;

connection.on("disconnected", () => {
  console.warn("⚠️ [MongoDB] Desconectado. Reintentando reconectar...");
});

connection.on("error", (err) => {
  console.error("❌ [MongoDB] Error en tiempo de ejecución:", err.message);
});

connectDB();

export default connection;
