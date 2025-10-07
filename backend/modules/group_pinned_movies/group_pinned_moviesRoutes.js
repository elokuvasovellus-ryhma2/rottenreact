import { Router } from 'express';
import { addGroupPinnedMovie, getGroupPinnedMovies,  } from './group_pinned_moviesController.js';

const router = Router();

// Add a pinned movie/review to a group
router.post('/', addGroupPinnedMovie);

// Get all pinned movies/reviews for a group
router.get('/:groupId', getGroupPinnedMovies);



export default router;
