import { Router } from 'express';
import { ReviewController, createReviewValidators } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create reviews (requires auth)
router.post('/contracts', authenticate, createReviewValidators, ReviewController.createContractReview);
router.post('/jobs', authenticate, createReviewValidators, ReviewController.createJobReview);
router.post('/gigs', authenticate, createReviewValidators, ReviewController.createGigReview);

// Get reviews (public)
router.get('/users/:userId', ReviewController.getUserReviews);
router.get('/contracts/:contractId', ReviewController.getContractReviews);

export default router;
