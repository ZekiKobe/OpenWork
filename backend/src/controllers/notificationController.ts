import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/auth';

export class NotificationController {
  /**
   * Get user notifications
   */
  static async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await NotificationService.getUserNotifications(
        req.user.id,
        page,
        limit,
        unreadOnly
      );

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: error.message || 'Failed to get notifications' });
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const notificationId = parseInt(req.params.id, 10);

      await NotificationService.markAsRead(notificationId, req.user.id);

      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error: any) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({ error: error.message || 'Failed to mark notification as read' });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      await NotificationService.markAllAsRead(req.user.id);

      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error: any) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({ error: error.message || 'Failed to mark all notifications as read' });
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const notificationId = parseInt(req.params.id, 10);

      await NotificationService.deleteNotification(notificationId, req.user.id);

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error: any) {
      console.error('Delete notification error:', error);
      res.status(500).json({ error: error.message || 'Failed to delete notification' });
    }
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const count = await NotificationService.getUnreadCount(req.user.id);

      res.json({ success: true, unreadCount: count });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(500).json({ error: error.message || 'Failed to get unread count' });
    }
  }
}
