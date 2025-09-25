import { pool } from '../../config/database.js';

export async function listReviews({ limit = 24, sort = 'created_at.desc', movieId }) {
  const [col, dir] = String(sort).toLowerCase().split('.');
  const allowedCols = { created_at: 'r.created_at', rating: 'r.rating', title: 'r.title' };
  const orderCol = allowedCols[col] || 'r.created_at';
  const orderDir = dir === 'asc' ? 'ASC' : 'DESC';

  const params = [];
  let where = '';
  if (movieId) {
    params.push(String(movieId));
    where = `WHERE r.movie_id = $${params.length}`;
  }
  params.push(limit);

  const sql = `
    SELECT r.id, r.movie_id, r.user_id, r.rating, r.body, r.title, r.created_at,
           u.email
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    ${where}
    ORDER BY ${orderCol} ${orderDir}
    LIMIT $${params.length};
  `;
  const { rows } = await pool.query(sql, params);

  
  return rows.map(r => ({
    id: r.id,
    movie_id: r.movie_id,
    user_id: r.user_id,
    rating: r.rating,
    body: r.body,
    title: r.title,
    created_at: r.created_at,
    user: { id: r.user_id, email: r.email }
  }));
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
