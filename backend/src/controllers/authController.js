import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { env } from "../config/env.js";

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nombre, correo y contraseña son requeridos" });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Correo inválido" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
  }

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    return res.status(409).json({ error: "El correo ya está registrado" });
  }

  const hash = await bcrypt.hash(password, 12);
  const [result] = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name.trim(), email.toLowerCase(), hash]
  );

  const token = jwt.sign({ userId: result.insertId }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  return res.status(201).json({ token, user: { id: result.insertId, name: name.trim(), email: email.toLowerCase() } });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Correo y contraseña son requeridos" });
  }

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
  if (rows.length === 0) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }

  const token = jwt.sign({ userId: user.id }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });

  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}
