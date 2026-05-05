import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { testDatabaseConnection } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import activitiesRoutes from "./routes/activities.js";
import pointsRoutes from "./routes/points.js";
import rewardsRoutes from "./routes/rewards.js";
import profileRoutes from "./routes/profile.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/points", pointsRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/profile", profileRoutes);

// Healthcheck
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

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
