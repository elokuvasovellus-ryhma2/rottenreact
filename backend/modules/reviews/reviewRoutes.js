import { Router } from 'express';
import { getReviews, postReview } from './reviewController.js';

const router = Router();

router.get('/', getReviews);   // GET /api/reviews
router.post('/', postReview);  // POST /api/reviews

export default router;
