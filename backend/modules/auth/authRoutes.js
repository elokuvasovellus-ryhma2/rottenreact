import { Router } from 'express';
import { signup, signin, deleteUser } from './authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.delete('/delete/:id', deleteUser);

export default router;
