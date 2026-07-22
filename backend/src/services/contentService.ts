import { Op } from 'sequelize';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Like from '../models/Like';
import User from '../models/User';
import { PointsService } from './pointsService';

export interface CreatePostData {
  title: string;
  content: string;
  tags: string[];
  thumbnail_url?: string;
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  category: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface CreateCommentData {
  content: string;
  parent_id?: number;
}

export interface PostWithDetails {
  id: number;
  title: string;
  content: string;
  tags: string[];
  thumbnail_url?: string;
  category: string;
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  is_hidden: boolean;
  created_at: Date;
  updated_at: Date;
  author: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  stats: {
    likes_count: number;
    comments_count: number;
  };
  user_like?: boolean;
}

export interface CommentWithDetails {
  id: number;
  content: string;
  is_hidden: boolean;
  created_at: Date;
  updated_at: Date;
  author: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  replies?: CommentWithDetails[];
  user_like?: boolean;
}

export class ContentService {
  // Posts
  static async createPost(userId: number, data: CreatePostData): Promise<PostWithDetails> {
    const post = await Post.create({
      user_id: userId,
      title: data.title.trim(),
      content: data.content.trim(),
      tags: data.tags || [],
      thumbnail_url: data.thumbnail_url,
      category: data.category,
      expertise_level: data.expertise_level,
      estimated_read_time: data.estimated_read_time,
      prerequisites: data.prerequisites || [],
      learning_objectives: data.learning_objectives || []
    });

    // Award points for post creation
    try {
      await PointsService.awardPostCreation(userId, post.id);
    } catch (error) {
      console.warn('Failed to award points for post creation:', error);
    }

    return this.getPostWithDetails(post.id, userId);
  }

  static async getPostWithDetails(postId: number, userId?: number): Promise<PostWithDetails> {
    const post = await Post.findByPk(postId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar_url']
      }]
    });

    if (!post || post.is_hidden) {
      throw new Error('Post not found');
    }

    // Get stats
    const [likesCount, commentsCount] = await Promise.all([
      Like.count({ where: { post_id: postId } }),
      Comment.count({ where: { post_id: postId, is_hidden: false } })
    ]);

    // Check if user liked this post
    let userLike = false;
    if (userId) {
      const like = await Like.findOne({
        where: { post_id: postId, user_id: userId }
      });
      userLike = !!like;
    }

    return {
      id: post.id,
      title: post.title,
      content: post.content,
      tags: post.tags,
      thumbnail_url: post.thumbnail_url,
      category: post.category,
      expertise_level: post.expertise_level,
      estimated_read_time: post.estimated_read_time,
      prerequisites: post.prerequisites,
      learning_objectives: post.learning_objectives,
      is_hidden: post.is_hidden,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: {
        id: post.author!.id,
        username: post.author!.username,
        avatar_url: post.author!.avatar_url
      },
      stats: {
        likes_count: likesCount,
        comments_count: commentsCount
      },
      user_like: userLike
    };
  }

  static async updatePost(postId: number, userId: number, data: UpdatePostData): Promise<PostWithDetails> {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.user_id !== userId) {
      throw new Error('Unauthorized to edit this post');
    }

    if (data.title !== undefined) {
      post.title = data.title.trim();
    }
    if (data.content !== undefined) {
      post.content = data.content.trim();
    }
    if (data.tags !== undefined) {
      post.tags = data.tags;
    }

    await post.save();

    return this.getPostWithDetails(postId, userId);
  }

  static async deletePost(postId: number, userId: number): Promise<void> {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.user_id !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await post.destroy(); // Soft delete
  }

  static async getPosts(page: number = 1, limit: number = 20, userId?: number, tag?: string): Promise<{
    posts: PostWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    const whereClause: any = { is_hidden: false };

    if (tag) {
      whereClause.tags = {
        [Op.contains]: [tag]
      };
    }

    const { count, rows } = await Post.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar_url']
      }],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Get stats for each post
    const posts = await Promise.all(
      rows.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          Like.count({ where: { post_id: post.id } }),
          Comment.count({ where: { post_id: post.id, is_hidden: false } })
        ]);

        let userLike = false;
        if (userId) {
          const like = await Like.findOne({
            where: { post_id: post.id, user_id: userId }
          });
          userLike = !!like;
        }

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          tags: post.tags,
          thumbnail_url: post.thumbnail_url,
          category: post.category,
          expertise_level: post.expertise_level,
          estimated_read_time: post.estimated_read_time,
          prerequisites: post.prerequisites,
          learning_objectives: post.learning_objectives,
          is_hidden: post.is_hidden,
          created_at: post.created_at,
          updated_at: post.updated_at,
          author: {
            id: post.author!.id,
            username: post.author!.username,
            avatar_url: post.author!.avatar_url
          },
          stats: {
            likes_count: likesCount,
            comments_count: commentsCount
          },
          user_like: userLike
        };
      })
    );

    return {
      posts,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Comments
  static async createComment(postId: number, userId: number, data: CreateCommentData): Promise<CommentWithDetails> {
    // Verify post exists
    const post = await Post.findByPk(postId);
    if (!post || post.is_hidden) {
      throw new Error('Post not found');
    }

    // If it's a reply, verify parent comment exists and belongs to the same post
    if (data.parent_id) {
      const parentComment = await Comment.findByPk(data.parent_id);
      if (!parentComment || parentComment.post_id !== postId || parentComment.is_hidden) {
        throw new Error('Parent comment not found');
      }
    }

    const comment = await Comment.create({
      post_id: postId,
      user_id: userId,
      parent_id: data.parent_id,
      content: data.content.trim(),
      is_hidden: false
    });

    // Award points for comment creation
    try {
      await PointsService.awardCommentCreation(userId, comment.id);
    } catch (error) {
      console.warn('Failed to award points for comment creation:', error);
    }

    return this.getCommentWithDetails(comment.id, userId);
  }

  static async getCommentWithDetails(commentId: number, userId?: number): Promise<CommentWithDetails> {
    const comment = await Comment.findByPk(commentId, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar_url']
      }]
    });

    if (!comment || comment.is_hidden) {
      throw new Error('Comment not found');
    }

    let userLike = false;
    if (userId) {
      // For comments, we might want to implement comment likes later
      // For now, this is just a placeholder
      userLike = false;
    }

    const result: CommentWithDetails = {
      id: comment.id,
      content: comment.content,
      is_hidden: comment.is_hidden,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: {
        id: comment.author!.id,
        username: comment.author!.username,
        avatar_url: comment.author!.avatar_url
      },
      user_like: userLike
    };

    // If this is a top-level comment, get replies
    if (!comment.parent_id) {
      const replies = await Comment.findAll({
        where: {
          parent_id: comment.id,
          is_hidden: false
        },
        include: [{
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'avatar_url']
        }],
        order: [['created_at', 'ASC']]
      });

      result.replies = replies.map(reply => ({
        id: reply.id,
        content: reply.content,
        is_hidden: reply.is_hidden,
        created_at: reply.created_at,
        updated_at: reply.updated_at,
        author: {
          id: reply.author!.id,
          username: reply.author!.username,
          avatar_url: reply.author!.avatar_url
        },
        user_like: false // Placeholder for now
      }));
    }

    return result;
  }

  static async getPostComments(postId: number, userId?: number): Promise<CommentWithDetails[]> {
    const comments = await Comment.findAll({
      where: {
        post_id: postId,
        parent_id: { [Op.is]: null } as any, // Only top-level comments
        is_hidden: false
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar_url']
      }],
      order: [['created_at', 'ASC']]
    });

    const commentsWithDetails = await Promise.all(
      comments.map(comment => this.getCommentWithDetails(comment.id, userId))
    );

    return commentsWithDetails;
  }

  // Likes
  static async toggleLike(postId: number, userId: number): Promise<{ liked: boolean; likes_count: number }> {
    // Verify post exists
    const post = await Post.findByPk(postId);
    if (!post || post.is_hidden) {
      throw new Error('Post not found');
    }

    // Check if user already liked this post
    const existingLike = await Like.findOne({
      where: { post_id: postId, user_id: userId }
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      const likesCount = await Like.count({ where: { post_id: postId } });
      return { liked: false, likes_count: likesCount };
    } else {
      // Like
      await Like.create({
        post_id: postId,
        user_id: userId
      });

      // Award points to the post author
      try {
        await PointsService.awardPostLike(post.user_id, postId, userId);
      } catch (error) {
        console.warn('Failed to award points for like:', error);
      }

      const likesCount = await Like.count({ where: { post_id: postId } });
      return { liked: true, likes_count: likesCount };
    }
  }

  // Admin/Moderator functions
  static async hidePost(postId: number, moderatorId: number): Promise<void> {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    post.is_hidden = true;
    await post.save();
  }

  static async hideComment(commentId: number, moderatorId: number): Promise<void> {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.is_hidden = true;
    await comment.save();
  }
}
