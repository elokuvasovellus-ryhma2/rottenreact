// modules/reviews/reviewModel.js
import { pool } from '../../config/database.js';

export async function listReviews({
  limit = 24,
  sort = 'created_at.desc',
  movieId,
  onlyMine = false,
  userId,
  userEmail,
}) {
  const [col, dir] = String(sort).toLowerCase().split('.');
  const allowedCols = { created_at: 'r.created_at', rating: 'r.rating', title: 'r.title' };
  const orderCol = allowedCols[col] || 'r.created_at';
  const orderDir = dir === 'asc' ? 'ASC' : 'DESC';

  const params = [];
  const where = [];

  if (movieId != null && String(movieId) !== '') {
    params.push(String(movieId));
    where.push(`r.movie_id = $${params.length}`);
  }

  if (onlyMine) {
    if (userId != null && String(userId) !== '') {
      params.push(String(userId));
      where.push(`r.user_id = $${params.length}`);
    } else if (userEmail && String(userEmail).trim() !== '') {
      params.push(String(userEmail).toLowerCase());
      where.push(`LOWER(u.email) = $${params.length}`);
    }
  }

  params.push(Number(limit));

  const sql = `
    SELECT r.id, r.movie_id, r.user_id, r.rating, r.body, r.title, r.created_at,
           u.email
    FROM reviews r
    LEFT JOIN users u ON u.id = r.user_id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
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
  const params = [String(movie_id), user_id, Number(rating), body ?? '', title ?? null];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}
