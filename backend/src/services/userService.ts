import User, { UserRole, UserStatus } from '../models/User';
import Post from '../models/Post';
import Comment from '../models/Comment';
import Like from '../models/Like';
import PointsLog from '../models/PointsLog';
import { Op } from 'sequelize';

export interface UpdateProfileData {
  username?: string;
  bio?: string;
  avatar_url?: string;
  // Professional Information
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  // Skills and Expertise
  skills?: string[];
  expertise_areas?: string[];
  // Experience
  years_of_experience?: number;
  current_role?: string;
  // Education
  education_level?: string;
  field_of_study?: string;
  // Social Links
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  // Preferences
  is_public_profile?: boolean;
  show_email?: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  bio?: string;
  avatar_url?: string;
  // Professional Information
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  // Skills and Expertise
  skills?: string[];
  expertise_areas?: string[];
  // Experience
  years_of_experience?: number;
  current_role?: string;
  // Education
  education_level?: string;
  field_of_study?: string;
  // Social Links
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  // Preferences
  is_public_profile: boolean;
  show_email: boolean;
  // System fields
  role: UserRole;
  status: UserStatus;
  total_points: number;
  created_at: Date;
  stats: {
    posts_count: number;
    comments_count: number;
    likes_given: number;
    likes_received: number;
  };
}

export class UserService {
  static async getUserProfile(userId: number): Promise<UserProfile> {
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'username', 'bio', 'avatar_url', 'role', 'status', 'total_points', 'created_at',
        'title', 'company', 'location', 'website', 'skills', 'expertise_areas',
        'years_of_experience', 'current_role', 'education_level', 'field_of_study',
        'linkedin_url', 'github_url', 'twitter_url', 'is_public_profile', 'show_email'
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get user statistics
    const [postsCount, commentsCount, likesGiven, likesReceived] = await Promise.all([
      Post.count({ where: { user_id: userId } }),
      Comment.count({ where: { user_id: userId } }),
      Like.count({ where: { user_id: userId } }),
      Like.count({
        include: [{
          model: Post,
          as: 'post',
          where: { user_id: userId }
        }]
      })
    ]);

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      // Professional Information
      title: user.title,
      company: user.company,
      location: user.location,
      website: user.website,
      // Skills and Expertise
      skills: user.skills,
      expertise_areas: user.expertise_areas,
      // Experience
      years_of_experience: user.years_of_experience,
      current_role: user.current_role,
      // Education
      education_level: user.education_level,
      field_of_study: user.field_of_study,
      // Social Links
      linkedin_url: user.linkedin_url,
      github_url: user.github_url,
      twitter_url: user.twitter_url,
      // Preferences
      is_public_profile: user.is_public_profile,
      show_email: user.show_email,
      // System fields
      role: user.role,
      status: user.status,
      total_points: user.total_points,
      created_at: user.created_at,
      stats: {
        posts_count: postsCount,
        comments_count: commentsCount,
        likes_given: likesGiven,
        likes_received: likesReceived
      }
    };
  }

  static async updateProfile(userId: number, data: UpdateProfileData): Promise<UserProfile> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check username uniqueness if updating
    if (data.username && data.username !== user.username) {
      const existingUser = await User.findOne({
        where: { username: data.username.trim() }
      });

      if (existingUser) {
        throw new Error('Username already taken');
      }

      user.username = data.username.trim();
    }

    // Update other fields
    if (data.bio !== undefined) {
      user.bio = data.bio?.trim() || undefined;
    }

    if (data.avatar_url !== undefined) {
      user.avatar_url = data.avatar_url?.trim() || undefined;
    }

    // Professional Information
    if (data.title !== undefined) {
      user.title = data.title?.trim() || undefined;
    }

    if (data.company !== undefined) {
      user.company = data.company?.trim() || undefined;
    }

    if (data.location !== undefined) {
      user.location = data.location?.trim() || undefined;
    }

    if (data.website !== undefined) {
      user.website = data.website?.trim() || undefined;
    }

    // Skills and Expertise
    if (data.skills !== undefined) {
      user.skills = data.skills || [];
    }

    if (data.expertise_areas !== undefined) {
      user.expertise_areas = data.expertise_areas || [];
    }

    // Experience
    if (data.years_of_experience !== undefined) {
      user.years_of_experience = data.years_of_experience;
    }

    if (data.current_role !== undefined) {
      user.current_role = data.current_role?.trim() || undefined;
    }

    // Education
    if (data.education_level !== undefined) {
      user.education_level = data.education_level;
    }

    if (data.field_of_study !== undefined) {
      user.field_of_study = data.field_of_study?.trim() || undefined;
    }

    // Social Links
    if (data.linkedin_url !== undefined) {
      user.linkedin_url = data.linkedin_url?.trim() || undefined;
    }

    if (data.github_url !== undefined) {
      user.github_url = data.github_url?.trim() || undefined;
    }

    if (data.twitter_url !== undefined) {
      user.twitter_url = data.twitter_url?.trim() || undefined;
    }

    // Preferences
    if (data.is_public_profile !== undefined) {
      user.is_public_profile = data.is_public_profile;
    }

    if (data.show_email !== undefined) {
      user.show_email = data.show_email;
    }

    await user.save();

    return this.getUserProfile(userId);
  }

  static async getPublicProfile(username: string): Promise<UserProfile> {
    console.log('Searching for user with username:', username);
    const user = await User.findOne({
      where: { username },
      attributes: ['id', 'username', 'bio', 'avatar_url', 'role', 'status', 'total_points', 'created_at', 'is_public_profile']
    });

    if (!user) {
      console.log('User not found in database');
      throw new Error('User not found');
    }

    console.log('User found:', { id: user.id, username: user.username, status: user.status, is_public_profile: user.is_public_profile });

    if (user.status !== UserStatus.ACTIVE) {
      console.log('User status is not active:', user.status);
      throw new Error('User profile is not available');
    }

    if (!user.is_public_profile) {
      console.log('User profile is set to private');
      throw new Error('User profile is not available');
    }

    return this.getUserProfile(user.id);
  }

  // Admin functions
  static async getAllUsers(page: number = 1, limit: number = 20): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      attributes: [
        'id', 'username', 'email', 'bio', 'avatar_url', 'role', 'status', 'total_points', 'created_at',
        'title', 'company', 'location', 'website', 'skills', 'expertise_areas',
        'years_of_experience', 'current_role', 'education_level', 'field_of_study',
        'linkedin_url', 'github_url', 'twitter_url', 'is_public_profile', 'show_email'
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    // Get stats for each user
    const users = await Promise.all(
      rows.map(async (user) => {
        const [postsCount, commentsCount, likesGiven, likesReceived] = await Promise.all([
          Post.count({ where: { user_id: user.id } }),
          Comment.count({ where: { user_id: user.id } }),
          Like.count({ where: { user_id: user.id } }),
          Like.count({
            include: [{
              model: Post,
              as: 'post',
              where: { user_id: user.id }
            }]
          })
        ]);

        return {
          id: user.id,
          username: user.username,
          bio: user.bio,
          avatar_url: user.avatar_url,
          // Professional Information
          title: user.title,
          company: user.company,
          location: user.location,
          website: user.website,
          // Skills and Expertise
          skills: user.skills,
          expertise_areas: user.expertise_areas,
          // Experience
          years_of_experience: user.years_of_experience,
          current_role: user.current_role,
          // Education
          education_level: user.education_level,
          field_of_study: user.field_of_study,
          // Social Links
          linkedin_url: user.linkedin_url,
          github_url: user.github_url,
          twitter_url: user.twitter_url,
          // Preferences
          is_public_profile: user.is_public_profile,
          show_email: user.show_email,
          // System fields
          role: user.role,
          status: user.status,
          total_points: user.total_points,
          created_at: user.created_at,
          stats: {
            posts_count: postsCount,
            comments_count: commentsCount,
            likes_given: likesGiven,
            likes_received: likesReceived
          }
        };
      })
    );

    return {
      users,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  static async updateUserRole(userId: number, newRole: UserRole, adminUserId: number): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent self-demotion
    if (userId === adminUserId && newRole !== UserRole.ADMIN) {
      throw new Error('Cannot change your own admin role');
    }

    user.role = newRole;
    await user.save();
  }

  static async updateUserStatus(userId: number, newStatus: UserStatus, adminUserId: number): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Prevent suspending yourself
    if (userId === adminUserId && newStatus === UserStatus.SUSPENDED) {
      throw new Error('Cannot suspend your own account');
    }

    user.status = newStatus;
    await user.save();
  }

  static async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<{
    users: UserProfile[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      where: {
        status: UserStatus.ACTIVE,
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: [
        'id', 'username', 'bio', 'avatar_url', 'role', 'status', 'total_points', 'created_at',
        'title', 'company', 'location', 'website', 'skills', 'expertise_areas',
        'years_of_experience', 'current_role', 'education_level', 'field_of_study',
        'linkedin_url', 'github_url', 'twitter_url', 'is_public_profile', 'show_email'
      ],
      limit,
      offset,
      order: [['username', 'ASC']]
    });

    const users = rows.map(user => ({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      // Professional Information
      title: user.title,
      company: user.company,
      location: user.location,
      website: user.website,
      // Skills and Expertise
      skills: user.skills,
      expertise_areas: user.expertise_areas,
      // Experience
      years_of_experience: user.years_of_experience,
      current_role: user.current_role,
      // Education
      education_level: user.education_level,
      field_of_study: user.field_of_study,
      // Social Links
      linkedin_url: user.linkedin_url,
      github_url: user.github_url,
      twitter_url: user.twitter_url,
      // Preferences
      is_public_profile: user.is_public_profile,
      show_email: user.show_email,
      // System fields
      role: user.role,
      status: user.status,
      total_points: user.total_points,
      created_at: user.created_at,
      stats: {
        posts_count: 0, // Will be populated if needed
        comments_count: 0,
        likes_given: 0,
        likes_received: 0
      }
    }));

    return {
      users,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  static async getPublicProfileById(userId: number): Promise<UserProfile> {
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'username', 'bio', 'avatar_url', 'role', 'status', 'total_points', 'created_at',
        'title', 'company', 'location', 'website', 'skills', 'expertise_areas',
        'years_of_experience', 'current_role', 'education_level', 'field_of_study',
        'linkedin_url', 'github_url', 'twitter_url', 'is_public_profile', 'show_email'
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('User profile is not available');
    }

    // Get user statistics
    const [postsCount, commentsCount, likesGiven, likesReceived] = await Promise.all([
      Post.count({ where: { user_id: userId } }),
      Comment.count({ where: { user_id: userId } }),
      Like.count({ where: { user_id: userId } }),
      Like.count({
        include: [{
          model: Post,
          as: 'post',
          where: { user_id: userId }
        }]
      })
    ]);

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      // Professional Information
      title: user.title,
      company: user.company,
      location: user.location,
      website: user.website,
      // Skills and Expertise
      skills: user.skills,
      expertise_areas: user.expertise_areas,
      // Experience
      years_of_experience: user.years_of_experience,
      current_role: user.current_role,
      // Education
      education_level: user.education_level,
      field_of_study: user.field_of_study,
      // Social Links
      linkedin_url: user.linkedin_url,
      github_url: user.github_url,
      twitter_url: user.twitter_url,
      // Preferences
      is_public_profile: user.is_public_profile,
      show_email: user.show_email,
      // System fields
      role: user.role,
      status: user.status,
      total_points: user.total_points,
      created_at: user.created_at,
      stats: {
        posts_count: postsCount,
        comments_count: commentsCount,
        likes_given: likesGiven,
        likes_received: likesReceived
      }
    };
  }

  static async getFreelancers(options: {
    page: number;
    limit: number;
    skill?: string;
    experience_level?: string;
    location?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{
    freelancers: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }> {
    const { page, limit, skill, experience_level, location, search, sortBy, sortOrder } = options;
    const offset = (page - 1) * limit;

    const where: any = { role: UserRole.FREELANCER };

    // Apply filters
    if (skill) {
      where.skills = { [Op.contains]: [skill] };
    }

    if (experience_level) {
      // Assuming experience_level is stored in current_role or years_of_experience
      // We can customize this based on actual data structure
      if (experience_level === 'entry') {
        where.years_of_experience = { [Op.lt]: 2 };
      } else if (experience_level === 'intermediate') {
        where.years_of_experience = { [Op.between]: [2, 5] };
      } else if (experience_level === 'expert') {
        where.years_of_experience = { [Op.gte]: 5 };
      }
    }

    if (location) {
      where.location = { [Op.iLike]: `%${location}%` };
    }

    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } },
        { skills: { [Op.contains]: [search] } }
      ];
    }

    // Define sort column mapping
    const sortColumnMap: Record<string, string> = {
      'rating': 'total_points', // Using points as proxy for rating
      'newest': 'created_at',
      'points': 'total_points',
      'rate-high': 'hourly_rate_max',
      'rate-low': 'hourly_rate_min',
      'created_at': 'created_at',
      'total_points': 'total_points'
    };

    const sortColumn = sortColumnMap[sortBy || ''] || 'total_points';
    const orderDirection = sortOrder || 'DESC';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortColumn, orderDirection]],
      attributes: [
        'id', 'username', 'bio', 'avatar_url', 'role', 'status', 'total_points', 'created_at',
        'title', 'location', 'skills', 'years_of_experience', 'education_level', 'current_role'
      ],
    });

    // Transform the results to match the frontend requirements
    const freelancers = rows.map(user => {
      // Estimate rating based on total_points
      const rating = Math.min(5, Math.max(1, Math.floor(user.total_points / 250) || 4));
      
      // Estimate hourly rates based on experience and points
      const baseRate = Math.max(15, Math.floor(user.total_points / 100));
      
      return {
        id: user.id,
        username: user.username,
        title: user.title || 'Freelancer',
        bio: user.bio || 'No bio available',
        avatar_url: user.avatar_url,
        location: user.location || 'Remote',
        total_points: user.total_points,
        rating: rating,
        reviews_count: Math.floor(user.total_points / 100), // Estimation
        skills: Array.isArray(user.skills) ? user.skills : [],
        hourly_rate_min: baseRate,
        hourly_rate_max: baseRate + 20, // Range based on skills
        experience_level: user.years_of_experience && user.years_of_experience < 2 ? 'entry' :
                  user.years_of_experience && user.years_of_experience <= 5 ? 'intermediate' : 'expert',
        education_level: user.education_level,
        years_of_experience: user.years_of_experience,
        joined_date: user.created_at.toISOString(),
        is_online: true // Placeholder
      };
    });

    return {
      freelancers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    };
  }
}
