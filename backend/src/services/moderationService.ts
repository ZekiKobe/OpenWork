import { Op } from 'sequelize';
import Report, { ReportTargetType, ReportStatus, ReportReason } from '../models/Report';
import Post from '../models/Post';
import Comment from '../models/Comment';
import User, { UserStatus } from '../models/User';
import { PointsService } from './pointsService';
import { ContentService } from './contentService';

export interface CreateReportData {
  target_type: ReportTargetType;
  target_id: number;
  reason: ReportReason;
  description?: string;
}

export interface ReportWithDetails {
  id: number;
  reporter: {
    id: number;
    username: string;
  };
  target_type: ReportTargetType;
  target_id: number;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  moderator?: {
    id: number;
    username: string;
  };
  moderator_notes?: string;
  created_at: Date;
  updated_at: Date;
  target_content?: {
    title?: string;
    content?: string;
    author?: string;
  };
}

export interface ModerationStats {
  pending_reports: number;
  resolved_reports: number;
  total_reports: number;
  hidden_posts: number;
  hidden_comments: number;
  suspended_users: number;
}

export class ModerationService {
  static async createReport(userId: number, data: CreateReportData): Promise<ReportWithDetails> {
    const { target_type, target_id, reason, description } = data;

    // Verify target exists and is not hidden
    let targetExists = false;
    let targetContent: any = {};

    if (target_type === ReportTargetType.POST) {
      const post = await Post.findByPk(target_id);
      if (post && !post.is_hidden) {
        targetExists = true;
        targetContent = {
          title: post.title,
          content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
          author: (await User.findByPk(post.user_id))?.username
        };
      }
    } else if (target_type === ReportTargetType.COMMENT) {
      const comment = await Comment.findByPk(target_id);
      if (comment && !comment.is_hidden) {
        targetExists = true;
        targetContent = {
          content: comment.content,
          author: (await User.findByPk(comment.user_id))?.username
        };
      }
    } else if (target_type === ReportTargetType.USER) {
      const user = await User.findByPk(target_id);
      if (user && user.status === 'active') {
        targetExists = true;
        targetContent = {
          author: user.username
        };
      }
    }

    if (!targetExists) {
      throw new Error('Target not found or already moderated');
    }

    // Check if user already reported this target
    const existingReport = await Report.findOne({
      where: {
        reporter_id: userId,
        target_type,
        target_id,
        status: {
          [Op.in]: [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW]
        }
      }
    });

    if (existingReport) {
      throw new Error('You have already reported this content');
    }

    const report = await Report.create({
      reporter_id: userId,
      target_type,
      target_id,
      reason,
      description: description?.trim()
    });

    return this.getReportWithDetails(report.id);
  }

  static async getReportWithDetails(reportId: number): Promise<ReportWithDetails> {
    const report = await Report.findByPk(reportId, {
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'moderator',
          attributes: ['id', 'username'],
          required: false
        }
      ]
    });

    if (!report) {
      throw new Error('Report not found');
    }

    const result: ReportWithDetails = {
      id: report.id,
      reporter: {
        id: report.reporter!.id,
        username: report.reporter!.username
      },
      target_type: report.target_type,
      target_id: report.target_id,
      reason: report.reason,
      description: report.description,
      status: report.status,
      moderator_notes: report.moderator_notes,
      created_at: report.created_at,
      updated_at: report.updated_at
    };

    if (report.moderator) {
      result.moderator = {
        id: report.moderator.id,
        username: report.moderator.username
      };
    }

    // Add target content preview
    if (report.target_type === ReportTargetType.POST) {
      const post = await Post.findByPk(report.target_id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['username']
        }]
      });
      if (post) {
        result.target_content = {
          title: post.title,
          content: post.content.substring(0, 200) + (post.content.length > 200 ? '...' : ''),
          author: post.author?.username
        };
      }
    } else if (report.target_type === ReportTargetType.COMMENT) {
      const comment = await Comment.findByPk(report.target_id, {
        include: [{
          model: User,
          as: 'author',
          attributes: ['username']
        }]
      });
      if (comment) {
        result.target_content = {
          content: comment.content,
          author: comment.author?.username
        };
      }
    }

    return result;
  }

  static async getReports(status?: ReportStatus, page: number = 1, limit: number = 20): Promise<{
    reports: ReportWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Report.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'reporter',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'moderator',
          attributes: ['id', 'username'],
          required: false
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const reports = await Promise.all(
      rows.map(report => this.getReportWithDetails(report.id))
    );

    return {
      reports,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  static async resolveReport(reportId: number, moderatorId: number, action: 'approve' | 'dismiss', notes?: string): Promise<void> {
    const report = await Report.findByPk(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    if (report.status !== ReportStatus.PENDING && report.status !== ReportStatus.UNDER_REVIEW) {
      throw new Error('Report is already resolved');
    }

    const transaction = await Report.sequelize!.transaction();

    try {
      if (action === 'approve') {
        // Take action based on target type
        if (report.target_type === ReportTargetType.POST) {
          await ContentService.hidePost(report.target_id, moderatorId);
          // Revoke points from post author
          const post = await Post.findByPk(report.target_id, { transaction });
          if (post) {
            await PointsService.revokePoints(post.user_id, 10, 'Post reported and hidden', report.target_id);
          }
        } else if (report.target_type === ReportTargetType.COMMENT) {
          await ContentService.hideComment(report.target_id, moderatorId);
          // Revoke points from comment author
          const comment = await Comment.findByPk(report.target_id, { transaction });
          if (comment) {
            await PointsService.revokePoints(comment.user_id, 2, 'Comment reported and hidden', report.target_id);
          }
        }
        // For user reports, we might suspend the user (handled separately)

        report.status = ReportStatus.RESOLVED;
      } else {
        report.status = ReportStatus.DISMISSED;
      }

      report.moderator_id = moderatorId;
      report.moderator_notes = notes?.trim();

      await report.save({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async getModerationStats(): Promise<ModerationStats> {
    const [
      pendingReports,
      resolvedReports,
      totalReports,
      hiddenPosts,
      hiddenComments,
      suspendedUsers
    ] = await Promise.all([
      Report.count({ where: { status: ReportStatus.PENDING } }),
      Report.count({ where: { status: ReportStatus.RESOLVED } }),
      Report.count(),
      Post.count({ where: { is_hidden: true } }),
      Comment.count({ where: { is_hidden: true } }),
      User.count({ where: { status: 'suspended' } })
    ]);

    return {
      pending_reports: pendingReports,
      resolved_reports: resolvedReports,
      total_reports: totalReports,
      hidden_posts: hiddenPosts,
      hidden_comments: hiddenComments,
      suspended_users: suspendedUsers
    };
  }

  static async suspendUser(userId: number, moderatorId: number, reason: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.role === 'admin') {
      throw new Error('Cannot suspend admin users');
    }

    user.status = UserStatus.SUSPENDED;
    await user.save();

    // Log this action (we could create a moderation log table in the future)
    console.log(`User ${user.username} suspended by moderator ${moderatorId}: ${reason}`);
  }

  static async reinstateUser(userId: number, moderatorId: number): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.status = UserStatus.ACTIVE;
    await user.save();

    console.log(`User ${user.username} reinstated by moderator ${moderatorId}`);
  }
}
