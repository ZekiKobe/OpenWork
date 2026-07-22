import { Op } from 'sequelize';
import Notification, { NotificationType } from '../models/Notification';
import User from '../models/User';

export class NotificationService {
  /**
   * Create notification
   */
  static async createNotification(
    userId: number,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>
  ): Promise<Notification> {
    const notification = await Notification.create({
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata
    });

    const { emitToUser } = await import('../realtime/socket');
    emitToUser(userId, 'notification', notification.toJSON());

    return notification;
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ) {
    const offset = (page - 1) * limit;
    const where: any = { user_id: userId };

    if (unreadOnly) {
      where.is_read = false;
    }

    const { rows, count } = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const unreadCount = await Notification.count({
      where: { user_id: userId, is_read: false }
    });

    return {
      notifications: rows,
      unreadCount,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number, userId: number): Promise<void> {
    await Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          id: notificationId,
          user_id: userId
        }
      }
    );
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(userId: number): Promise<void> {
    await Notification.update(
      {
        is_read: true,
        read_at: new Date()
      },
      {
        where: {
          user_id: userId,
          is_read: false
        }
      }
    );
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: number, userId: number): Promise<void> {
    await Notification.destroy({
      where: {
        id: notificationId,
        user_id: userId
      }
    });
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: number): Promise<number> {
    return await Notification.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });
  }

  // Helper methods for common notification types
  static async notifyMessage(userId: number, senderName: string, link: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.MESSAGE,
      'New Message',
      `You have a new message from ${senderName}`,
      link
    );
  }

  static async notifyJobApplication(userId: number, jobTitle: string, link: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.JOB_APPLICATION,
      'New Job Application',
      `You have a new application for "${jobTitle}"`,
      link
    );
  }

  static async notifyPaymentReceived(userId: number, amount: number, link: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.PAYMENT_RECEIVED,
      'Payment Received',
      `You received $${amount.toFixed(2)}`,
      link
    );
  }

  static async notifyContractAccepted(userId: number, contractTitle: string, link: string): Promise<void> {
    await this.createNotification(
      userId,
      NotificationType.CONTRACT_ACCEPTED,
      'Contract Accepted',
      `Your contract "${contractTitle}" has been accepted`,
      link
    );
  }
}
