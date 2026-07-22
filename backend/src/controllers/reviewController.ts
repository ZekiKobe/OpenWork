import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';
import { AuthenticatedRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

export class ReviewController {
  /**
   * Create contract review
   */
  static async createContractReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { contract_id, rating, comment } = req.body;

      const review = await ReviewService.createContractReview(
        req.user.id,
        contract_id,
        rating,
        comment
      );

      res.status(201).json({
        success: true,
        review,
        message: 'Review submitted successfully'
      });
    } catch (error: any) {
      console.error('Create contract review error:', error);
      res.status(400).json({ error: error.message || 'Failed to create review' });
    }
  }

  /**
   * Create job review
   */
  static async createJobReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { job_id, reviewee_id, rating, comment } = req.body;

      const review = await ReviewService.createJobReview(
        req.user.id,
        job_id,
        reviewee_id,
        rating,
        comment
      );

      res.status(201).json({
        success: true,
        review,
        message: 'Review submitted successfully'
      });
    } catch (error: any) {
      console.error('Create job review error:', error);
      res.status(400).json({ error: error.message || 'Failed to create review' });
    }
  }

  /**
   * Create gig review
   */
  static async createGigReview(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { gig_id, reviewee_id, rating, comment } = req.body;

      const review = await ReviewService.createGigReview(
        req.user.id,
        gig_id,
        reviewee_id,
        rating,
        comment
      );

      res.status(201).json({
        success: true,
        review,
        message: 'Review submitted successfully'
      });
    } catch (error: any) {
      console.error('Create gig review error:', error);
      res.status(400).json({ error: error.message || 'Failed to create review' });
    }
  }

  /**
   * Get user reviews
   */
  static async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId, 10);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await ReviewService.getUserReviews(userId, page, limit);

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get user reviews error:', error);
      res.status(500).json({ error: error.message || 'Failed to get reviews' });
    }
  }

  /**
   * Get contract reviews
   */
  static async getContractReviews(req: Request, res: Response): Promise<void> {
    try {
      const contractId = parseInt(req.params.contractId, 10);

      const reviews = await ReviewService.getContractReviews(contractId);

      res.json({ success: true, reviews });
    } catch (error: any) {
      console.error('Get contract reviews error:', error);
      res.status(500).json({ error: error.message || 'Failed to get reviews' });
    }
  }
}

export const createReviewValidators = [
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
];
