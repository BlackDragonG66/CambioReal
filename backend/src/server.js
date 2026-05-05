import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { env } from "./config/env.js";
import { testDatabaseConnection } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import activitiesRoutes from "./routes/activities.js";
import pointsRoutes from "./routes/points.js";
import rewardsRoutes from "./routes/rewards.js";
import profileRoutes from "./routes/profile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// FRONTEND_DIR puede sobreescribirse con variable de entorno desde el panel de Hostinger
const FRONTEND_DIR = process.env.FRONTEND_DIR || join(__dirname, "../../frontend");

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(FRONTEND_DIR));

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/profile", profileRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// SPA fallback — cualquier ruta no-API sirve index.html
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Ruta no encontrada" });
  }
  res.sendFile(join(FRONTEND_DIR, "index.html"));
});

// Manejo global de errores
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

async function main() {
  try {
    await testDatabaseConnection();
    console.log("✅ Base de datos conectada");
  } catch (e) {
    console.error("⚠️  No se pudo conectar a la base de datos:", e.message);
  }

  app.listen(env.port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${env.port}`);
  });
}

main();
