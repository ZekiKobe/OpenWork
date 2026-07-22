import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { ModerationService, CreateReportData } from '../services/moderationService';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRole, UserStatus } from '../models/User';
import { ReportStatus, ReportReason } from '../models/Report';

export const createReportValidators = [
  body('target_type')
    .isIn(['post', 'comment', 'user'])
    .withMessage('Target type must be post, comment, or user'),
  body('target_id')
    .isInt({ min: 1 })
    .withMessage('Target ID must be a valid integer'),
  body('reason')
    .isIn(Object.values(ReportReason))
    .withMessage('Invalid report reason'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters')
];

export class ModerationController {
  static async createReport(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const data: CreateReportData = req.body;
      const report = await ModerationService.createReport(req.user.id, data);

      res.status(201).json({
        message: 'Report submitted successfully',
        report
      });
    } catch (error: any) {
      console.error('Create report error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getReports(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR)) {
        res.status(403).json({ error: 'Admin or moderator access required' });
        return;
      }

      const status = req.query.status as ReportStatus;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (status && !Object.values(ReportStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status filter' });
        return;
      }

      const result = await ModerationService.getReports(status, page, limit);
      res.json(result);
    } catch (error: any) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async resolveReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR)) {
        res.status(403).json({ error: 'Admin or moderator access required' });
        return;
      }

      const { reportId } = req.params;
      const { action, notes } = req.body;

      if (!['approve', 'dismiss'].includes(action)) {
        res.status(400).json({ error: 'Action must be approve or dismiss' });
        return;
      }

      await ModerationService.resolveReport(parseInt(reportId), req.user.id, action, notes);

      res.json({
        message: `Report ${action}d successfully`
      });
    } catch (error: any) {
      console.error('Resolve report error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getModerationStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR)) {
        res.status(403).json({ error: 'Admin or moderator access required' });
        return;
      }

      const stats = await ModerationService.getModerationStats();
      res.json({ stats });
    } catch (error: any) {
      console.error('Get moderation stats error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async suspendUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;
      const { reason } = req.body;

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        res.status(400).json({ error: 'Suspension reason is required' });
        return;
      }

      await ModerationService.suspendUser(parseInt(userId), req.user.id, reason.trim());

      res.json({ message: 'User suspended successfully' });
    } catch (error: any) {
      console.error('Suspend user error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async reinstateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;
      await ModerationService.reinstateUser(parseInt(userId), req.user.id);

      res.json({ message: 'User reinstated successfully' });
    } catch (error: any) {
      console.error('Reinstate user error:', error);
      res.status(400).json({ error: error.message });
    }
  }
}
