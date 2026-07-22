import { Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { UserService, UpdateProfileData } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRole, UserStatus } from '../models/User';

export const updateProfileValidators = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('avatar_url')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL'),
  // Professional Information
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title must be less than 100 characters'),
  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company must be less than 100 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('website')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Website must be less than 500 characters')
    .matches(/^https?:\/\/.+|^$/)
    .withMessage('Website must be a valid URL or empty'),
  // Skills and Expertise
  body('skills')
    .optional(),
  body('expertise_areas')
    .optional(),
  // Experience
  body('years_of_experience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
  body('current_role')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Current role must be less than 100 characters'),
  // Education
  body('education_level')
    .optional()
    .isIn(['high_school', 'associate', 'bachelor', 'master', 'phd', 'other'])
    .withMessage('Invalid education level'),
  body('field_of_study')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Field of study must be less than 100 characters'),
  // Social Links
  body('linkedin_url')
    .optional()
    .isLength({ max: 500 })
    .withMessage('LinkedIn URL must be less than 500 characters')
    .matches(/^https?:\/\/.+|^$/)
    .withMessage('LinkedIn URL must be a valid URL or empty'),
  body('github_url')
    .optional()
    .isLength({ max: 500 })
    .withMessage('GitHub URL must be less than 500 characters')
    .matches(/^https?:\/\/.+|^$/)
    .withMessage('GitHub URL must be a valid URL or empty'),
  body('twitter_url')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Twitter URL must be less than 500 characters')
    .matches(/^https?:\/\/.+|^$/)
    .withMessage('Twitter URL must be a valid URL or empty'),
  // Preferences
  body('is_public_profile')
    .optional()
    .isBoolean()
    .withMessage('is_public_profile must be a boolean'),
  body('show_email')
    .optional()
    .isBoolean()
    .withMessage('show_email must be a boolean')
];

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const profile = await UserService.getUserProfile(req.user.id);
      res.json({ profile });
    } catch (error: any) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const data: UpdateProfileData = req.body;
      const profile = await UserService.updateProfile(req.user.id, data);

      res.json({
        message: 'Profile updated successfully',
        profile
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getPublicProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      console.log('GET /users/:username called with username:', username);

      const profile = await UserService.getPublicProfile(username);
      res.json({ profile });
    } catch (error: any) {
      console.error('Get public profile error:', error);
      res.status(404).json({ error: error.message });
    }
  }

  // Admin routes
  static async getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await UserService.getAllUsers(page, limit);
      res.json(result);
    } catch (error: any) {
      console.error('Get all users error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { userId } = req.params;
      const { role } = req.body;

      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      await UserService.updateUserRole(parseInt(userId), role, req.user.id);

      res.json({ message: 'User role updated successfully' });
    } catch (error: any) {
      console.error('Update user role error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.MODERATOR)) {
        res.status(403).json({ error: 'Admin or moderator access required' });
        return;
      }

      const { userId } = req.params;
      const { status } = req.body;

      if (!Object.values(UserStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }

      await UserService.updateUserStatus(parseInt(userId), status, req.user.id);

      res.json({ message: 'User status updated successfully' });
    } catch (error: any) {
      console.error('Update user status error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async searchUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q: query, page, limit } = req.query;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Search query is required' });
        return;
      }

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;

      const result = await UserService.searchUsers(query, pageNum, limitNum);
      res.json(result);
    } catch (error: any) {
      console.error('Search users error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getFreelancers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page, limit, skill, experience_level, location, search, sortBy, sortOrder } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 20;

      const result = await UserService.getFreelancers({
        page: pageNum,
        limit: limitNum,
        skill: skill as string,
        experience_level: experience_level as string,
        location: location as string,
        search: search as string,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC' || 'DESC'
      });

      res.json(result);
    } catch (error: any) {
      console.error('Get freelancers error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
      }

      const profile = await UserService.getPublicProfileById(userId);
      res.json({ profile });
    } catch (error: any) {
      console.error('Get user by ID error:', error);
      res.status(404).json({ error: error.message });
    }
  }
}
