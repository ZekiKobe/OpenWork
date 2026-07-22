import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Op } from 'sequelize';
import User, { UserRole, UserStatus } from '../models/User';
import { generateToken, generateRefreshToken, generateEmailVerificationToken, generatePasswordResetToken } from '../utils/jwt';
import RefreshToken from '../models/RefreshToken';
import EmailVerification from '../models/EmailVerification';
import PasswordReset from '../models/PasswordReset';
import { EmailService } from './emailService';

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  role?: 'freelancer' | 'client';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
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
    is_public_profile?: boolean;
    show_email?: boolean;
    // System fields
    role: UserRole;
    status: UserStatus;
    total_points: number;
    email_verified: boolean;
    created_at: Date;
  };
  token: string;
  refreshToken?: string;
}

export class AuthService {
  private static formatAuthUser(user: User): AuthResponse['user'] {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      title: user.title,
      company: user.company,
      location: user.location,
      website: user.website,
      skills: user.skills,
      expertise_areas: user.expertise_areas,
      years_of_experience: user.years_of_experience,
      current_role: user.current_role,
      education_level: user.education_level,
      field_of_study: user.field_of_study,
      linkedin_url: user.linkedin_url,
      github_url: user.github_url,
      twitter_url: user.twitter_url,
      is_public_profile: user.is_public_profile,
      show_email: user.show_email,
      role: user.role,
      status: user.status,
      total_points: user.total_points,
      email_verified: user.email_verified,
      created_at: user.created_at
    };
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, username, role } = data;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        email: email.toLowerCase().trim()
      }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const existingUsername = await User.findOne({
      where: { username: username.trim() }
    });

    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Create new user
    const userRole = role === 'freelancer' ? UserRole.FREELANCER :
                    role === 'client' ? UserRole.CLIENT :
                    UserRole.USER;

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password_hash: password, // Will be hashed by the model hook
      username: username.trim(),
      role: userRole,
      status: UserStatus.ACTIVE,
      email_verified: false
    });

    // Create email verification token
    const verificationToken = generateEmailVerificationToken();
    await EmailVerification.create({
      user_id: user.id,
      email: user.email,
      token: verificationToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await EmailService.sendVerificationEmail(user.email, verificationToken);

    const token = generateToken(user);
    const refreshToken = generateRefreshToken();
    
    // Store refresh token
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return {
      user: {
        id: user.id,
        email: user.email,
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
        email_verified: user.email_verified,
        created_at: user.created_at
      },
      token
    };
  }

  static async login(data: LoginData): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Account is suspended');
    }

    const isValidPassword = await user.checkPassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken();
    
    // Store refresh token
    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return {
      user: {
        id: user.id,
        email: user.email,
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
        email_verified: user.email_verified,
        created_at: user.created_at
      },
      token,
      refreshToken
    };
  }

  static async getCurrentUser(userId: number) {
    const user = await User.findByPk(userId, {
      attributes: [
        'id', 'email', 'username', 'bio', 'avatar_url', 'role', 'status', 'total_points', 'email_verified', 'created_at',
        'title', 'company', 'location', 'website', 'skills', 'expertise_areas',
        'years_of_experience', 'current_role', 'education_level', 'field_of_study',
        'linkedin_url', 'github_url', 'twitter_url', 'is_public_profile', 'show_email'
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
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
      email_verified: user.email_verified,
      created_at: user.created_at
    };
  }

  /**
   * Refresh access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const tokenRecord = await RefreshToken.findOne({
      where: { token: refreshToken },
      include: [{ model: User, as: 'user' }]
    });

    if (!tokenRecord || !tokenRecord.isValid) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findByPk(tokenRecord.user_id);
    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new Error('User not found or inactive');
    }

    // Revoke old refresh token
    await tokenRecord.update({ revoked_at: new Date() });

    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken();

    // Store new refresh token
    await RefreshToken.create({
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string): Promise<void> {
    const verification = await EmailVerification.findOne({
      where: { token }
    });

    if (!verification || !verification.isValid) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user
    await User.update(
      { email_verified: true },
      { where: { id: verification.user_id } }
    );

    // Mark verification as used
    await verification.update({ verified_at: new Date() });
  }

  /**
   * Resend verification email
   */
  static async resendVerificationEmail(email: string): Promise<void> {
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.email_verified) {
      throw new Error('Email already verified');
    }

    // Invalidate old tokens
    await EmailVerification.update(
      { verified_at: new Date() },
      { where: { user_id: user.id, verified_at: { [Op.is]: null as any } } }
    );

    // Create new verification token
    const verificationToken = generateEmailVerificationToken();
    await EmailVerification.create({
      user_id: user.id,
      email: user.email,
      token: verificationToken,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await EmailService.sendVerificationEmail(user.email, verificationToken);
  }

  /**
   * Request password reset
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Don't reveal if user exists for security
      return;
    }

    // Invalidate old tokens
    await PasswordReset.update(
      { used_at: new Date() },
      { where: { user_id: user.id, used_at: { [Op.is]: null as any } } }
    );

    // Create reset token
    const resetToken = generatePasswordResetToken();
    await PasswordReset.create({
      user_id: user.id,
      email: user.email,
      token: resetToken,
      expires_at: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    await EmailService.sendPasswordResetEmail(user.email, resetToken);
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const reset = await PasswordReset.findOne({
      where: { token }
    });

    if (!reset || !reset.isValid) {
      throw new Error('Invalid or expired reset token');
    }

    // Update password
    const user = await User.findByPk(reset.user_id);
    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ password_hash: newPassword });

    // Mark token as used
    await reset.update({ used_at: new Date() });

    // Revoke all refresh tokens for security
    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: user.id, revoked_at: { [Op.is]: null as any } } }
    );
  }

  /**
   * Logout (revoke refresh token)
   */
  static async logout(refreshToken: string): Promise<void> {
    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { token: refreshToken, revoked_at: { [Op.is]: null as any } } }
    );
  }

  /**
   * Google OAuth sign-in via ID token
   */
  static async googleLogin(credential: string): Promise<AuthResponse> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new Error('Google sign-in is not configured');
    }

    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });

    const payload = ticket.getPayload();
    if (!payload?.email) {
      throw new Error('Invalid Google token');
    }

    const email = payload.email.toLowerCase().trim();
    let user = await User.findOne({ where: { email } });

    if (!user) {
      const baseUsername = (email.split('@')[0] || 'user')
        .replace(/[^a-zA-Z0-9_]/g, '_')
        .slice(0, 40) || 'user';
      let username = baseUsername;
      let suffix = 1;
      while (await User.findOne({ where: { username } })) {
        username = `${baseUsername}_${suffix++}`;
      }

      user = await User.create({
        email,
        password_hash: crypto.randomBytes(32).toString('hex'),
        username,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        email_verified: true,
        avatar_url: payload.picture
      });
    } else {
      if (user.status !== UserStatus.ACTIVE) {
        throw new Error('Account is suspended');
      }

      const updates: Partial<{ avatar_url: string; email_verified: boolean }> = {};
      if (payload.picture && !user.avatar_url) {
        updates.avatar_url = payload.picture;
      }
      if (!user.email_verified) {
        updates.email_verified = true;
      }
      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken();

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    return {
      user: this.formatAuthUser(user),
      token,
      refreshToken
    };
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const isValidPassword = await user.checkPassword(currentPassword);
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    await user.update({ password_hash: newPassword });

    await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { user_id: user.id, revoked_at: { [Op.is]: null as any } } }
    );
  }
}
