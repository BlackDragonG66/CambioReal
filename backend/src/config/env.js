import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Siempre busca backend/.env independientemente del process.cwd()
dotenv.config({ path: join(__dirname, "../../.env") });

export const env = {
  port: Number(process.env.PORT || 4000),
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || "u450340862_cambio",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "u450340862_cambio",
  jwtSecret: process.env.JWT_SECRET || "change_this_secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d"
};
