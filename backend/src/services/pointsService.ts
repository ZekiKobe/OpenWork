import { Op } from 'sequelize';
import User from '../models/User';
import PointsLog, { PointsSource } from '../models/PointsLog';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Like from '../models/Like';

export interface PointsConfig {
  POST_CREATION: number;
  POST_LIKE: number;
  COMMENT_CREATION: number;
  POST_HELPFUL: number;
  MODERATOR_BONUS: number;
  DAILY_CAP: number;
  COOLDOWN_MINUTES: number;
}

// Point earning configuration
const POINTS_CONFIG: PointsConfig = {
  POST_CREATION: 10,
  POST_LIKE: 1,
  COMMENT_CREATION: 2,
  POST_HELPFUL: 5,
  MODERATOR_BONUS: 10,
  DAILY_CAP: 100, // Maximum points per day
  COOLDOWN_MINUTES: 5 // Minimum time between posts
};

export class PointsService {
  /**
   * Award points for creating a post
   */
  static async awardPostCreation(userId: number, postId: number): Promise<void> {
    // Check cooldown
    const recentPost = await Post.findOne({
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: new Date(Date.now() - POINTS_CONFIG.COOLDOWN_MINUTES * 60 * 1000)
        }
      }
    });

    if (recentPost) {
      throw new Error(`Please wait ${POINTS_CONFIG.COOLDOWN_MINUTES} minutes between posts`);
    }

    // Check daily cap
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayPoints = await PointsLog.sum('points', {
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: todayStart
        },
        points: {
          [Op.gt]: 0 // Only count positive points
        }
      }
    }) || 0;

    if (todayPoints >= POINTS_CONFIG.DAILY_CAP) {
      throw new Error('Daily points limit reached');
    }

    const pointsToAward = Math.min(
      POINTS_CONFIG.POST_CREATION,
      POINTS_CONFIG.DAILY_CAP - todayPoints
    );

    await this.addPoints(userId, PointsSource.POST_CREATION, pointsToAward, postId, 'Post creation reward');
  }

  /**
   * Award points for receiving a like on a post
   */
  static async awardPostLike(likedUserId: number, postId: number, likerUserId: number): Promise<void> {
    // Don't award points for self-likes
    if (likedUserId === likerUserId) {
      return;
    }

    // Check if user already received points for this like
    const existingLog = await PointsLog.findOne({
      where: {
        user_id: likedUserId,
        source: PointsSource.POST_LIKE,
        reference_id: postId
      }
    });

    if (existingLog) {
      return; // Already awarded points for this post
    }

    // Check daily cap
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayPoints = await PointsLog.sum('points', {
      where: {
        user_id: likedUserId,
        created_at: {
          [Op.gte]: todayStart
        },
        points: {
          [Op.gt]: 0
        }
      }
    }) || 0;

    if (todayPoints >= POINTS_CONFIG.DAILY_CAP) {
      return; // Skip awarding if daily cap reached
    }

    const pointsToAward = Math.min(
      POINTS_CONFIG.POST_LIKE,
      POINTS_CONFIG.DAILY_CAP - todayPoints
    );

    await this.addPoints(likedUserId, PointsSource.POST_LIKE, pointsToAward, postId, 'Post like reward');
  }

  /**
   * Award points for creating a comment
   */
  static async awardCommentCreation(userId: number, commentId: number): Promise<void> {
    // Check daily cap
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayPoints = await PointsLog.sum('points', {
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: todayStart
        },
        points: {
          [Op.gt]: 0
        }
      }
    }) || 0;

    if (todayPoints >= POINTS_CONFIG.DAILY_CAP) {
      throw new Error('Daily points limit reached');
    }

    const pointsToAward = Math.min(
      POINTS_CONFIG.COMMENT_CREATION,
      POINTS_CONFIG.DAILY_CAP - todayPoints
    );

    await this.addPoints(userId, PointsSource.COMMENT_CREATION, pointsToAward, commentId, 'Comment creation reward');
  }

  /**
   * Award points for post marked as helpful by moderator
   */
  static async awardHelpfulPost(userId: number, postId: number): Promise<void> {
    await this.addPoints(userId, PointsSource.POST_HELPFUL, POINTS_CONFIG.POST_HELPFUL, postId, 'Post marked as helpful');
  }

  /**
   * Award bonus points from moderator
   */
  static async awardModeratorBonus(userId: number, reason: string): Promise<void> {
    await this.addPoints(userId, PointsSource.MODERATOR_BONUS, POINTS_CONFIG.MODERATOR_BONUS, undefined, reason);
  }

  /**
   * Revoke points (for spam reports, violations, etc.)
   */
  static async revokePoints(userId: number, points: number, reason: string, referenceId?: number): Promise<void> {
    if (points <= 0) {
      throw new Error('Points to revoke must be positive');
    }

    await this.addPoints(userId, PointsSource.REPORT_CONFIRMED, -points, referenceId, reason);
  }

  /**
   * Internal method to add/subtract points and update user total
   */
  private static async addPoints(
    userId: number,
    source: PointsSource,
    points: number,
    referenceId?: number,
    description?: string
  ): Promise<void> {
    const transaction = await PointsLog.sequelize!.transaction();

    try {
      // Create points log entry
      await PointsLog.create({
        user_id: userId,
        source,
        points,
        reference_id: referenceId,
        description
      }, { transaction });

      // Update user total points
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        throw new Error('User not found');
      }

      user.total_points += points;
      await user.save({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get user's points balance and history
   */
  static async getPointsBalance(userId: number): Promise<{
    total_points: number;
    today_points: number;
    history: any[];
  }> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayPoints = await PointsLog.sum('points', {
      where: {
        user_id: userId,
        created_at: {
          [Op.gte]: todayStart
        }
      }
    }) || 0;

    const history = await PointsLog.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit: 50,
      attributes: ['source', 'points', 'description', 'created_at']
    });

    return {
      total_points: user.total_points,
      today_points: todayPoints,
      history: history.map(log => ({
        source: log.source,
        points: log.points,
        description: log.description,
        created_at: log.created_at
      }))
    };
  }

  /**
   * Get points statistics for dashboard
   */
  static async getPointsStats(userId: number): Promise<{
    total_earned: number;
    total_lost: number;
    posts_created: number;
    likes_received: number;
    comments_made: number;
    helpful_posts: number;
  }> {
    const logs = await PointsLog.findAll({
      where: { user_id: userId },
      attributes: ['source', 'points']
    });

    const stats = {
      total_earned: 0,
      total_lost: 0,
      posts_created: 0,
      likes_received: 0,
      comments_made: 0,
      helpful_posts: 0
    };

    for (const log of logs) {
      if (log.points > 0) {
        stats.total_earned += log.points;
      } else {
        stats.total_lost += Math.abs(log.points);
      }

      switch (log.source) {
        case PointsSource.POST_CREATION:
          stats.posts_created += 1;
          break;
        case PointsSource.POST_LIKE:
          stats.likes_received += 1;
          break;
        case PointsSource.COMMENT_CREATION:
          stats.comments_made += 1;
          break;
        case PointsSource.POST_HELPFUL:
          stats.helpful_posts += 1;
          break;
      }
    }

    return stats;
  }
}
