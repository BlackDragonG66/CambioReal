import express from "express";
import cors from "cors";
import { existsSync } from "fs";
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

// Busca el frontend en varias ubicaciones posibles según el entorno
const FRONTEND_CANDIDATES = [
  process.env.FRONTEND_DIR,               // variable de entorno (prioridad máxima)
  join(__dirname, "../frontend"),          // nodejs/frontend/  ← Hostinger (frontend dentro del app root)
  join(__dirname, "../../frontend"),       // repo raíz/frontend ← local XAMPP
  join(__dirname, "../../public_html"),    // public_html de Hostinger como último recurso
].filter(Boolean);

const FRONTEND_DIR = FRONTEND_CANDIDATES.find(p => existsSync(p));

if (!FRONTEND_DIR) {
  console.error("⚠️  Frontend no encontrado. Rutas probadas:", FRONTEND_CANDIDATES);
  console.error("   Sube la carpeta frontend/ a nodejs/frontend/ en el File Manager de Hostinger");
  console.error("   O configura la variable de entorno FRONTEND_DIR en el panel de Hostinger");
} else {
  console.log(`📁 Frontend cargado desde: ${FRONTEND_DIR}`);
}

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend (solo si se encontró la carpeta)
if (FRONTEND_DIR) {
  app.use(express.static(FRONTEND_DIR));
}

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
  if (!FRONTEND_DIR) {
    return res.status(503).send("Frontend no configurado. Revisa los logs del servidor.");
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
