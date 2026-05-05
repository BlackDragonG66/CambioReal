import { pool } from "../config/db.js";

const VALID_STATUSES = ["pending", "completed", "expired", "cancelled"];
const VALID_CATEGORIES = ["salud", "trabajo", "casa", "estudio", "pareja", "familia", "dinero", "habitos", "diversion", "personal"];
const VALID_REPEAT = ["none", "daily", "weekly", "monthly"];

export async function listActivities(req, res) {
  const { from, to } = req.query;
  let query = "SELECT * FROM activities WHERE user_id = ?";
  const params = [req.userId];

  if (from) {
    query += " AND date >= ?";
    params.push(from);
  }
  if (to) {
    query += " AND date <= ?";
    params.push(to);
  }
  query += " ORDER BY date ASC, time ASC";

  const [rows] = await pool.query(query, params);
  return res.json(rows);
}

export async function createActivity(req, res) {
  const { title, description, date, time, points, category, repeat_type, reminder_minutes } = req.body;
  if (!title || !date || !points) {
    return res.status(400).json({ error: "Título, fecha y puntos son requeridos" });
  }
  if (!Number.isInteger(Number(points)) || Number(points) <= 0) {
    return res.status(400).json({ error: "Los puntos deben ser un número entero positivo" });
  }
  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: "Categoría inválida" });
  }
  const repeatType = repeat_type || "none";
  if (!VALID_REPEAT.includes(repeatType)) {
    return res.status(400).json({ error: "Tipo de repetición inválido" });
  }

  const [result] = await pool.query(
    `INSERT INTO activities (user_id, title, description, date, time, points, category, repeat_type, reminder_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.userId, title.trim(), description || null, date, time || null, Number(points), category || "personal", repeatType, reminder_minutes || null]
  );

  const [rows] = await pool.query("SELECT * FROM activities WHERE id = ?", [result.insertId]);
  return res.status(201).json(rows[0]);
}

export async function completeActivity(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    "SELECT * FROM activities WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }
  const activity = rows[0];
  if (activity.status === "completed") {
    return res.status(409).json({ error: "La actividad ya fue completada" });
  }

  await pool.query(
    "UPDATE activities SET status = 'completed', completed_at = NOW() WHERE id = ?",
    [id]
  );

  await pool.query(
    "INSERT INTO points_history (user_id, activity_id, points, type) VALUES (?, ?, ?, 'earn')",
    [req.userId, id, activity.points]
  );

  const [updated] = await pool.query("SELECT * FROM activities WHERE id = ?", [id]);
  return res.json({ activity: updated[0], points_earned: activity.points });
}

export async function updateActivity(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    "SELECT * FROM activities WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }
  if (rows[0].status === "completed") {
    return res.status(409).json({ error: "No se puede editar una actividad completada" });
  }

  const { title, description, date, time, points, category, repeat_type, reminder_minutes, status } = req.body;
  const current = rows[0];
  const newStatus = status || current.status;
  if (!VALID_STATUSES.includes(newStatus)) {
    return res.status(400).json({ error: "Estado inválido" });
  }

  await pool.query(
    `UPDATE activities SET
      title = ?, description = ?, date = ?, time = ?, points = ?,
      category = ?, repeat_type = ?, reminder_minutes = ?, status = ?
     WHERE id = ?`,
    [
      title || current.title,
      description !== undefined ? description : current.description,
      date || current.date,
      time !== undefined ? time : current.time,
      points ? Number(points) : current.points,
      category || current.category,
      repeat_type || current.repeat_type,
      reminder_minutes !== undefined ? reminder_minutes : current.reminder_minutes,
      newStatus,
      id
    ]
  );

  const [updated] = await pool.query("SELECT * FROM activities WHERE id = ?", [id]);
  return res.json(updated[0]);
}

export async function deleteActivity(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    "SELECT id FROM activities WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Actividad no encontrada" });
  }
  await pool.query("DELETE FROM activities WHERE id = ?", [id]);
  return res.json({ message: "Actividad eliminada" });
}
