import crypto from "crypto";
import { pool } from "../../config/database.js";

export async function createList(req, res) {
  try {
    const { userId, name } = req.body;
    if (!userId) return res.status(400).json({ error: "userId puuttuu" });
    if (!name || typeof name !== "string")
      return res.status(400).json({ error: "name puuttuu tai on virheellinen" });

    const listId = crypto.randomUUID();
    const shareUrl = crypto.randomUUID(); 

    const result = await pool.query(
      `
      INSERT INTO user_favorite_list (id, user_id, name, share_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, name, share_url
      `,
      [listId, userId, name.trim(), shareUrl]
    );

    return res.status(201).json({ message: "Lista luotu", list: result.rows[0] });
  } catch (err) {
    console.error("createList error:", err);
    return res.status(500).json({ error: "Listan luonti epäonnistui" });
  }
}


export async function addMovie(req, res) {
  try {
    const { listId, movieId } = req.body;
    if (!listId) return res.status(400).json({ error: "listId puuttuu" });
    if (!movieId) return res.status(400).json({ error: "movieId puuttuu" });

    await pool.query(
      `
      INSERT INTO user_favorite_movies (list_id, movie_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      `,
      [listId, String(movieId)]
    );

    return res.status(201).json({ message: "Elokuva lisätty listalle" });
  } catch (err) {
    console.error("addMovie error:", err);
    return res.status(500).json({ error: "Elokuvan lisääminen epäonnistui" });
  }
}


export async function getListMovies(req, res) {
  try {
    const { listId } = req.params;
    if (!listId) return res.status(400).json({ error: "listId puuttuu" });

    const moviesRes = await pool.query(
      `
      SELECT movie_id
      FROM user_favorite_movies
      WHERE list_id = $1
      ORDER BY movie_id
      `,
      [listId]
    );

    return res.status(200).json(moviesRes.rows);
  } catch (err) {
    console.error("getListMovies error:", err);
    return res.status(500).json({ error: "Suosikkien haku epäonnistui" });
  }
}


export async function getUserLists(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId puuttuu" });

    const result = await pool.query(
      `
      SELECT id, name, share_url
      FROM user_favorite_list
      WHERE user_id = $1
      ORDER BY name
      `,
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("getUserLists error:", err);
    return res.status(500).json({ error: "Listojen haku epäonnistui" });
  }
}


export async function getSharedList(req, res) {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: "token puuttuu" });

    const listRes = await pool.query(
      `
      SELECT id, name
      FROM user_favorite_list
      WHERE share_url = $1
      LIMIT 1
      `,
      [token]
    );

    if (listRes.rowCount === 0)
      return res.status(404).json({ error: "Lista ei löytynyt" });

    const list = listRes.rows[0];

    const itemsRes = await pool.query(
      `
      SELECT movie_id
      FROM user_favorite_movies
      WHERE list_id = $1
      ORDER BY movie_id
      `,
      [list.id]
    );

   
    return res.status(200).json({
      list,               
      items: itemsRes.rows 
    });
  } catch (err) {
    console.error("getSharedList error:", err);
    return res.status(500).json({ error: "Jaetun listan haku epäonnistui" });
  }
}


export async function rotateShareUrl(req, res) {
  try {
    const { listId } = req.params;
    if (!listId) return res.status(400).json({ error: "listId puuttuu" });

    const newToken = crypto.randomUUID();

    const upd = await pool.query(
      `
      UPDATE user_favorite_list
      SET share_url = $1
      WHERE id = $2
      RETURNING id, name, share_url
      `,
      [newToken, listId]
    );

    if (upd.rowCount === 0)
      return res.status(404).json({ error: "Lista ei löytynyt" });

    return res.status(200).json({
      message: "Uusi jakolinkki luotu",
      list: upd.rows[0],
    });
  } catch (err) {
    console.error("rotateShareUrl error:", err);
    return res.status(500).json({ error: "Share-URLin kierrätys epäonnistui" });
  }
}
