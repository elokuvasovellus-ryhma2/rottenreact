
import { Router } from 'express';
import {
  createList,
  addMovie,
  getListMovies,
  getUserLists,
  removeMovie
} from './favoritesController.js';

const router = Router();

router.post('/create', createList);
router.post('/add', addMovie);
router.get('/user-lists/:userId', getUserLists);
router.post('/remove', removeMovie);
router.get('/:listId', getListMovies);

export default router;