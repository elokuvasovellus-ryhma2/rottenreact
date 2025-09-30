
import crypto from 'crypto';
import { pool } from '../../config/database.js';

// Luo uusi lista käyttäjälle
export async function createList(req, res) {
  try {
    const { userId, name } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId puuttuu' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name puuttuu tai on virheellinen' });
    }

    const listId = crypto.randomUUID();
    const shareUrl = crypto.randomUUID();

    const result = await pool.query(
      `
      INSERT INTO user_favorite_list (id, user_id, name, share_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, name, share_url
      `,
      [listId, userId, name, shareUrl]
    );

    return res.status(201).json({
      message: 'Lista luotu',
      list: result.rows[0]
    });
  } catch (err) {
    console.error('createList error:', err);
    return res.status(500).json({ error: 'Listan luonti epäonnistui' });
  }
}

// Lisää elokuva listalle
export async function addMovie(req, res) {
  try {
    const { listId, movieId } = req.body;

    if (!listId) {
      return res.status(400).json({ error: 'listId puuttuu' });
    }
    if (!movieId) {
      return res.status(400).json({ error: 'movieId puuttuu' });
    }

    const result = await pool.query(
      `
      INSERT INTO user_favorite_movies (list_id, movie_id)
      VALUES ($1, $2)
      ON CONFLICT ON CONSTRAINT unique_movie_per_list DO NOTHING
      RETURNING movie_id
      `,
      [listId, movieId]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ message: 'Elokuva oli jo listalla' });
    }

    return res.status(201).json({ message: 'Elokuva lisätty listalle' });
  } catch (err) {
    console.error('addMovie error:', err);
    return res.status(500).json({ error: 'Elokuvan lisääminen epäonnistui' });
  }
}

// Hae listan elokuvat

import fetch from 'node-fetch'; 

export async function getListMovies(req, res) {
  try {
    const { listId } = req.params;
    if (!listId) return res.status(400).json({ error: 'listId puuttuu' });

    const result = await pool.query(
      `SELECT movie_id FROM user_favorite_movies WHERE list_id = $1`,
      [listId]
    );

    const movieIds = result.rows.map(row => row.movie_id);

    const enrichedMovies = await Promise.all(
      movieIds.map(async id => {
        const tmdbRes = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=eng-eng`);
        const data = await tmdbRes.json();

        return {
          movie_id: id,
          title: data.title,
          description: data.overview,
          image_url: `https://image.tmdb.org/t/p/w500${data.poster_path}`
        };
      })
    );

    return res.status(200).json(enrichedMovies);
  } catch (err) {
    console.error('getListMovies error:', err);
    return res.status(500).json({ error: 'Suosikkien haku epäonnistui' });
  }
}

// Hae käyttäjän kaikki listat
export async function getUserLists(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'userId puuttuu' });
    }

    const result = await pool.query(
      `
      SELECT id, name, share_url
      FROM user_favorite_list
      WHERE user_id = $1
      `,
      [userId]
    );

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('getUserLists error:', err);
    return res.status(500).json({ error: 'Listojen haku epäonnistui' });
  }
}

//Poisto 
export async function removeMovie(req, res) {
  try {
    const { listId, movieId } = req.body;

    if (!listId || !movieId) {
      return res.status(400).json({ error: 'listId tai movieId puuttuu' });
    }

    await pool.query(
      `
      DELETE FROM user_favorite_movies
      WHERE list_id = $1 AND movie_id = $2
      `,
      [listId, movieId]
    );

    return res.status(200).json({ message: 'Elokuva poistettu listalta' });
  } catch (err) {
    console.error('removeMovie error:', err);
    return res.status(500).json({ error: 'Poisto epäonnistui' });
  }
}