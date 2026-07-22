import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ContentService, CreatePostData, UpdatePostData, CreateCommentData } from '../services/contentService';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

export const createPostValidators = [
  body('title')
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('content')
    .isLength({ min: 50, max: 10000 })
    .withMessage('Content must be between 50 and 10000 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Category must be between 2 and 50 characters'),
  body('expertise_level')
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid expertise level'),
  body('thumbnail_url')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL'),
  body('estimated_read_time')
    .optional()
    .isInt({ min: 1, max: 60 })
    .withMessage('Read time must be between 1 and 60 minutes'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each tag must be between 2 and 50 characters'),
  body('prerequisites')
    .optional(),
  body('learning_objectives')
    .optional()
];

export const updatePostValidators = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  body('content')
    .optional()
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Maximum 10 tags allowed'),
  body('tags.*')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each tag must be between 2 and 50 characters')
];

export const createCommentValidators = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Parent ID must be a valid integer')
];

export class ContentController {
  // Posts
  static async createPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      console.log('Create post request body:', req.body);
      console.log('Authenticated user:', req.user?.id);

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const data: CreatePostData = req.body;
      const post = await ContentService.createPost(req.user.id, data);

      res.status(201).json({
        message: 'Post created successfully',
        post
      });
    } catch (error: any) {
      console.error('Create post error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getPosts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const tag = req.query.tag as string;

      const result = await ContentService.getPosts(page, limit, req.user?.id, tag);
      res.json(result);
    } catch (error: any) {
      console.error('Get posts error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getPost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const post = await ContentService.getPostWithDetails(parseInt(postId), req.user?.id);
      res.json({ post });
    } catch (error: any) {
      console.error('Get post error:', error);
      res.status(404).json({ error: error.message });
    }
  }

  static async updatePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { postId } = req.params;
      const data: UpdatePostData = req.body;

      const post = await ContentService.updatePost(parseInt(postId), req.user.id, data);

      res.json({
        message: 'Post updated successfully',
        post
      });
    } catch (error: any) {
      console.error('Update post error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async deletePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { postId } = req.params;
      await ContentService.deletePost(parseInt(postId), req.user.id);

      res.json({ message: 'Post deleted successfully' });
    } catch (error: any) {
      console.error('Delete post error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Comments
  static async createComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { postId } = req.params;
      const data: CreateCommentData = req.body;

      const comment = await ContentService.createComment(parseInt(postId), req.user.id, data);

      res.status(201).json({
        message: 'Comment created successfully',
        comment
      });
    } catch (error: any) {
      console.error('Create comment error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getPostComments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const comments = await ContentService.getPostComments(parseInt(postId), req.user?.id);
      res.json({ comments });
    } catch (error: any) {
      console.error('Get post comments error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Likes
  static async toggleLike(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { postId } = req.params;
      const result = await ContentService.toggleLike(parseInt(postId), req.user.id);

      res.json({
        message: result.liked ? 'Post liked' : 'Post unliked',
        ...result
      });
    } catch (error: any) {
      console.error('Toggle like error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Admin/Moderator routes
  static async hidePost(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR)) {
        res.status(403).json({ error: 'Admin or moderator access required' });
        return;
      }

      const { postId } = req.params;
      await ContentService.hidePost(parseInt(postId), req.user.id);

      res.json({ message: 'Post hidden successfully' });
    } catch (error: any) {
      console.error('Hide post error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async hideComment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR)) {
        res.status(403).json({ error: 'Admin or moderator access required' });
        return;
      }

      const { commentId } = req.params;
      await ContentService.hideComment(parseInt(commentId), req.user.id);

      res.json({ message: 'Comment hidden successfully' });
    } catch (error: any) {
      console.error('Hide comment error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
