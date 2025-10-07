import { pool } from '../../config/database.js';

export async function addGroupPinnedMovieModel(groupId, movieId, reviewId = null, userId) {
  const sql = `
    INSERT INTO group_pinned_movies (group_id, movie_id, review_id, added_by_user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const params = [groupId, movieId, reviewId, userId];
  const { rows } = await pool.query(sql, params);
  return rows[0];
}

export async function getGroupPinnedMoviesModel(groupId) {
  const sql = `
    SELECT 
      gpm.group_id,
      gpm.movie_id,
      gpm.review_id,
      gpm.added_by_user_id,
      r.title as review_title,
      r.body as review_body,
      r.rating as review_rating,
      r.created_at as review_created_at,
      u.email as added_by_email
    FROM group_pinned_movies gpm
    LEFT JOIN reviews r ON gpm.review_id = r.id
    LEFT JOIN users u ON gpm.added_by_user_id = u.id
    WHERE gpm.group_id = $1
    ORDER BY gpm.added_by_user_id, gpm.movie_id;
  `;
  const { rows } = await pool.query(sql, [groupId]);
  return rows;
}


