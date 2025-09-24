import { pool } from '../../config/database.js';

export async function listReviews({ limit = 24, sort = 'created_at.desc', movieId }) {
  const [col, dir] = String(sort).toLowerCase().split('.');
  const allowedCols = { created_at: 'created_at', rating: 'rating', title: 'title' };
  const orderCol = allowedCols[col] || 'created_at';
  const orderDir = dir === 'asc' ? 'ASC' : 'DESC';

  const params = [];
  let where = '';
  if (movieId) {
    params.push(String(movieId));
    where = `WHERE movie_id = $${params.length}`;
  }
  params.push(limit);

  const sql = `
    SELECT id, movie_id, user_id, rating, body, title, created_at
    FROM reviews
    ${where}
    ORDER BY ${orderCol} ${orderDir}
    LIMIT $${params.length};
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function createReview({ movie_id, user_id = null, rating, title = null, body = '' }) {
  const sql = `
    INSERT INTO reviews (movie_id, user_id, rating, body, title, created_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING id, movie_id, user_id, rating, body, title, created_at;
  `;
  const params = [String(movie_id), user_id, Number(rating), body, title];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}
