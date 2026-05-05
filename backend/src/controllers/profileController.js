import { pool } from "../config/db.js";

export async function getProfile(req, res) {
  const [userRows] = await pool.query(
    "SELECT id, name, email, created_at FROM users WHERE id = ?",
    [req.userId]
  );
  if (userRows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

  const [balanceRows] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='earn' THEN points ELSE 0 END), 0) -
       COALESCE(SUM(CASE WHEN type='redeem' THEN points ELSE 0 END), 0) AS balance,
       COALESCE(SUM(CASE WHEN type='earn' THEN points ELSE 0 END), 0) AS total_earned
     FROM points_history WHERE user_id = ?`,
    [req.userId]
  );

  // Racha: días consecutivos con al menos una actividad completada
  const [streakRows] = await pool.query(
    `SELECT DATE(completed_at) AS day
     FROM activities
     WHERE user_id = ? AND status = 'completed'
     GROUP BY DATE(completed_at)
     ORDER BY day DESC`,
    [req.userId]
  );

  let streak = 0;
  if (streakRows.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < streakRows.length; i++) {
      const day = new Date(streakRows[i].day);
      day.setHours(0, 0, 0, 0);
      const expected = new Date(today);
      expected.setDate(today.getDate() - i);
      if (day.getTime() === expected.getTime()) {
        streak++;
      } else {
        break;
      }
    }
  }

  return res.json({
    ...userRows[0],
    balance: Number(balanceRows[0].balance),
    total_earned: Number(balanceRows[0].total_earned),
    streak
  });
}
