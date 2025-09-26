
import { Router } from 'express';
import {
  createList,
  addMovie,
  getListMovies,
  getUserLists
} from './favoritesController.js';

const router = Router();

router.post('/create', createList);
router.post('/add', addMovie);
router.get('/:listId', getListMovies);
router.get('/user-lists/:userId', getUserLists);

export default router;