import { pool } from "../config/db.js";

export async function listRewards(req, res) {
  const [rows] = await pool.query(
    "SELECT * FROM rewards WHERE user_id = ? ORDER BY points_required ASC",
    [req.userId]
  );
  return res.json(rows);
}

export async function createReward(req, res) {
  const { title, description, points_required } = req.body;
  if (!title || !points_required) {
    return res.status(400).json({ error: "Título y puntos requeridos son obligatorios" });
  }
  if (!Number.isInteger(Number(points_required)) || Number(points_required) <= 0) {
    return res.status(400).json({ error: "Los puntos deben ser un número entero positivo" });
  }

  const [result] = await pool.query(
    "INSERT INTO rewards (user_id, title, description, points_required) VALUES (?, ?, ?, ?)",
    [req.userId, title.trim(), description || null, Number(points_required)]
  );

  const [rows] = await pool.query("SELECT * FROM rewards WHERE id = ?", [result.insertId]);
  return res.status(201).json(rows[0]);
}

export async function redeemReward(req, res) {
  const { id } = req.params;
  const [rewardRows] = await pool.query(
    "SELECT * FROM rewards WHERE id = ? AND user_id = ? AND is_active = 1",
    [id, req.userId]
  );
  if (rewardRows.length === 0) {
    return res.status(404).json({ error: "Recompensa no encontrada o inactiva" });
  }
  const reward = rewardRows[0];

  const [balanceRows] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='earn' THEN points ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN type='redeem' THEN points ELSE 0 END), 0) AS balance
     FROM points_history WHERE user_id = ?`,
    [req.userId]
  );
  const balance = Number(balanceRows[0].balance);
  if (balance < reward.points_required) {
    return res.status(400).json({ error: "Puntos insuficientes", balance, required: reward.points_required });
  }

  await pool.query(
    "INSERT INTO points_history (user_id, reward_id, points, type) VALUES (?, ?, ?, 'redeem')",
    [req.userId, id, reward.points_required]
  );

  return res.json({ message: `Recompensa "${reward.title}" canjeada con éxito`, points_spent: reward.points_required });
}

export async function deleteReward(req, res) {
  const { id } = req.params;
  const [rows] = await pool.query(
    "SELECT id FROM rewards WHERE id = ? AND user_id = ?",
    [id, req.userId]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Recompensa no encontrada" });
  }
  await pool.query("UPDATE rewards SET is_active = 0 WHERE id = ?", [id]);
  return res.json({ message: "Recompensa desactivada" });
}
