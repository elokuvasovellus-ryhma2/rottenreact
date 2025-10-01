import crypto from "crypto";
import { pool } from "../../config/database.js";

export async function createGroup(req, res) {
  try {
    const { userId, name } = req.body;
    if (!userId) return res.status(400).json({ error: "userID missing" });
    if (!name || !name.trim()) return res.status(400).json({ error: "Name missing" });

    const id = crypto.randomUUID();

    const { rows: [group] } = await pool.query(
      `INSERT INTO groups (id, owner_user_id, name)
       VALUES ($1, $2, $3)
       RETURNING id, owner_user_id, name`,
      [id, userId, name.trim()]
    );

    return res.status(201).json({ message: "Ryhmä luotu", group });
  } catch (e) {
    console.error("createGroup error:", e);
    return res.status(500).json({ error: "Ryhmän luonti epäonnistui" });
  }
}

export async function getUserGroups(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId puuttuu" });

    const { rows } = await pool.query(
      `SELECT id, name
       FROM groups
       WHERE owner_user_id = $1
       ORDER BY name ASC`,
      [userId]
    );

    return res.json(rows);
  } catch (e) {
    console.error("getUserGroups error:", e);
    return res.status(500).json({ error: "Listojen haku epäonnistui" });
  }
}
