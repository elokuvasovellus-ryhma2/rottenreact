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
    if (!movie_id || rating == null) {
      return res.status(400).json({ message: 'movie_id and rating are required' });
    }
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    const row = await createReview({ movie_id, user_id, rating: r, title, body });
    res.status(201).json(row);

  } catch (e) {
    if (e?.code === '23505') {
      return res.status(409).json({ message: 'You have already reviewed this movie.' });
    }
    next(e);
  }
}

