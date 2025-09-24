import { listReviews, createReview } from './reviewModel.js';

export async function getReviews(req, res, next) {
  try {
    const { limit, sort, movieId } = req.query;
    const rows = await listReviews({ limit: Number(limit) || 24, sort, movieId });
    res.json(rows);
  } catch (e) { next(e); }
}

export async function postReview(req, res, next) {
  try {
    const { movie_id, user_id, rating, title, body } = req.body || {};
    if (!movie_id || !rating) return res.status(400).json({ message: 'movie_id and rating are required' });
    const row = await createReview({ movie_id, user_id, rating, title, body });
    res.status(201).json(row);
  } catch (e) { next(e); }
}
