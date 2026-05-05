import { pool } from "../config/db.js";

export async function getBalance(req, res) {
  const [rows] = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type='earn' THEN points ELSE 0 END), 0) AS earned,
       COALESCE(SUM(CASE WHEN type='redeem' THEN points ELSE 0 END), 0) AS redeemed
     FROM points_history WHERE user_id = ?`,
    [req.userId]
  );
  const earned = Number(rows[0].earned);
  const redeemed = Number(rows[0].redeemed);
  return res.json({ balance: earned - redeemed, earned, redeemed });
}

export async function getHistory(req, res) {
  const [rows] = await pool.query(
    "SELECT * FROM points_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
    [req.userId]
  );
  return res.json(rows);
}
