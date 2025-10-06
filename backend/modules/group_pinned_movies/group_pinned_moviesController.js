import { addGroupPinnedMovieModel, getGroupPinnedMoviesModel } from './group_pinned_moviesModel.js';

export async function addGroupPinnedMovie(req, res, next) {
  try {
    const { groupId, movieId, reviewId, userId } = req.body;
    const finalUserId = req.user?.id || userId || 'fe65d12a-2d15-4d2e-a817-9166f9f3bbba'; // Use default userId if none provided
    
    const result = await addGroupPinnedMovieModel(groupId, movieId, reviewId, finalUserId);
    res.json(result);
  } catch (e) { next(e); }
}

export async function getGroupPinnedMovies(req, res, next) {
  try {
    const { groupId } = req.params;
    const rows = await getGroupPinnedMoviesModel(groupId);
    res.json(rows);
  } catch (e) { next(e); }
}
