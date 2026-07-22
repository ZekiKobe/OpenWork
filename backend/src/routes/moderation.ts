import { Router } from 'express';
import { ModerationController, createReportValidators } from '../controllers/moderationController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Reports (authenticated users can create reports)
router.post('/reports', authenticate, createReportValidators, ModerationController.createReport);

// Admin/Moderator routes
router.use(requireRole(UserRole.ADMIN, UserRole.MODERATOR));
router.get('/reports', ModerationController.getReports);
router.put('/reports/:reportId/resolve', ModerationController.resolveReport);
router.get('/stats', ModerationController.getModerationStats);

// Admin only routes
router.post('/users/:userId/suspend', requireRole(UserRole.ADMIN), ModerationController.suspendUser);
router.post('/users/:userId/reinstate', requireRole(UserRole.ADMIN), ModerationController.reinstateUser);

export default router;
