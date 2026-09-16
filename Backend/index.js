import app from "./app.js";
import { config } from "./config.js";
import "./database.js";
import { ensureInitialSettings } from "./src/controllers/settingsController.js";

const PORT = config.port || 5000;

app.listen(PORT, async () => {
  const isCloud = process.env.RENDER || process.env.NODE_ENV === "production";
  console.log(`\n======================================================`);
  console.log(`⚡ CHUMPATIN XXL · SENIOR SEND-OFF PROMO 2026`);
  console.log(
    isCloud
      ? `🚀 Servidor Backend en la Nube (Render) activo en puerto ${PORT}\n🌐 URL Pública: https://chumpatin-dev.onrender.com`
      : `🚀 Servidor Backend corriendo localmente en: http://localhost:${PORT}`
  );
  console.log(`======================================================\n`);

  // Asegurar configuración del evento y tipos de boletos en MongoDB
  await ensureInitialSettings();
});
