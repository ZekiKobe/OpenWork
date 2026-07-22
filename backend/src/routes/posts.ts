import { Router, Request, Response, NextFunction } from 'express';
import { ContentController, createPostValidators, updatePostValidators, createCommentValidators } from '../controllers/contentController';
import { ModerationController, createReportValidators } from '../controllers/moderationController';
import { authenticate, requireRole, optionalAuth, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public routes (optional auth for better UX)
router.get('/', optionalAuth, ContentController.getPosts);
router.get('/:postId', optionalAuth, ContentController.getPost);
router.get('/:postId/comments', optionalAuth, ContentController.getPostComments);

// Protected routes
router.use(authenticate);
router.post('/', createPostValidators, ContentController.createPost);
router.put('/:postId', updatePostValidators, ContentController.updatePost);
router.delete('/:postId', ContentController.deletePost);

// Comments
router.post('/:postId/comments', createCommentValidators, ContentController.createComment);

// Likes
router.post('/:postId/like', ContentController.toggleLike);

// Reports
router.post('/:postId/report', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  req.body.target_type = 'post';
  req.body.target_id = parseInt(req.params.postId);
  next();
}, createReportValidators, ModerationController.createReport);

router.post('/comments/:commentId/report', authenticate, (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  req.body.target_type = 'comment';
  req.body.target_id = parseInt(req.params.commentId);
  next();
}, createReportValidators, ModerationController.createReport);

// Admin/Moderator routes
router.put('/:postId/hide', requireRole(UserRole.ADMIN, UserRole.MODERATOR), ContentController.hidePost);
router.put('/comments/:commentId/hide', requireRole(UserRole.ADMIN, UserRole.MODERATOR), ContentController.hideComment);

export default router;
