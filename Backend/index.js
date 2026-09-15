import app from "./app.js";
import { config } from "./config.js";
import "./database.js";
import { ensureAdminUser } from "./src/controllers/authController.js";
import { ensureInitialSettings } from "./src/controllers/settingsController.js";

const PORT = config.port || 5000;

app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`⚡ CHUMPATIN XXL · SENIOR SEND-OFF PROMO 2026`);
  console.log(`🚀 Servidor Backend corriendo en: http://localhost:${PORT}`);
  console.log(`======================================================\n`);

  // Asegurar usuario administrador inicial y configuración de fiesta en MongoDB
  await ensureAdminUser();
  await ensureInitialSettings();
});
