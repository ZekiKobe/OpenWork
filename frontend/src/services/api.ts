import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { AuthResponse, User, UserProfile, Post, Comment, PointsBalance, PointsStats, CreatePostData, UpdatePostData, CreateCommentData, UpdateProfileData, CreateReportData, Report, ModerationStats, PaginatedResponse } from '../types/index';

class ApiService {
  private api: AxiosInstance;
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshToken = localStorage.getItem('refresh_token');
          
          if (refreshToken) {
            try {
              const { token, refreshToken: newRefreshToken } = await this.refreshToken(refreshToken);
              localStorage.setItem('auth_token', token);
              localStorage.setItem('refresh_token', newRefreshToken);
              
              // Retry the original request with new token
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            } catch (refreshError) {
              // Refresh failed, logout user
              localStorage.removeItem('auth_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          } else {
            // No refresh token, logout
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', data);
    return response.data;
  }

  async register(data: { email: string; password: string; username: string; role?: 'freelancer' | 'client' }): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', data);
    return response.data;
  }

  async googleLogin(token: string): Promise<AuthResponse> {
    const response = await this.api.post('/auth/google', { token });
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    console.log('API Call: getCurrentUser');
    const response = await this.api.get('/auth/me');
    return response.data.user;
  }

  // User endpoints
  async getUserProfile(): Promise<UserProfile> {
    const response = await this.api.get('/users');
    return response.data.profile;
  }

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await this.api.put('/users', data);
    return response.data.profile;
  }

  async getPublicProfile(username: string): Promise<UserProfile> {
    console.log('API Call: getPublicProfile', username);
    const response = await this.api.get(`/users/${username}`);
    return response.data.profile;
  }

  async getUserById(userId: number): Promise<UserProfile> {
    const response = await this.api.get(`/users/id/${userId}`);
    return response.data.profile;
  }

  // Points endpoints
  async getPointsBalance(): Promise<PointsBalance> {
    const response = await this.api.get('/points/balance');
    return response.data;
  }

  async getPointsStats(): Promise<PointsStats> {
    const response = await this.api.get('/points/stats');
    return response.data;
  }

  // Posts endpoints
  async getPosts(page: number = 1, limit: number = 20, tag?: string): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (tag) params.append('tag', tag);

    const response = await this.api.get(`/posts?${params}`);
    // Map backend response format to frontend type
    const responseData = response.data;
    return {
      data: responseData.posts,
      total: responseData.total,
      page: responseData.page,
      totalPages: responseData.totalPages
    };
  }

  async getPost(postId: number): Promise<Post> {
    const response = await this.api.get(`/posts/${postId}`);
    return response.data.post;
  }

  async createPost(data: CreatePostData): Promise<Post> {
    const response = await this.api.post('/posts', data);
    return response.data.post;
  }

  async updatePost(postId: number, data: UpdatePostData): Promise<Post> {
    const response = await this.api.put(`/posts/${postId}`, data);
    return response.data.post;
  }

  async deletePost(postId: number): Promise<void> {
    await this.api.delete(`/posts/${postId}`);
  }

  async toggleLike(postId: number): Promise<{ liked: boolean; likes_count: number }> {
    const response = await this.api.post(`/posts/${postId}/like`);
    return response.data;
  }

  // Comments endpoints
  async createComment(postId: number, data: CreateCommentData): Promise<Comment> {
    const response = await this.api.post(`/posts/${postId}/comments`, data);
    return response.data.comment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    const response = await this.api.get(`/posts/${postId}/comments`);
    return response.data.comments;
  }

  // Reports endpoints
  async reportPost(postId: number, data: Omit<CreateReportData, 'target_type' | 'target_id'>): Promise<{ message: string }> {
    const response = await this.api.post(`/posts/${postId}/report`, {
      target_type: 'post',
      target_id: postId,
      ...data
    });
    return response.data;
  }

  async reportComment(commentId: number, data: Omit<CreateReportData, 'target_type' | 'target_id'>): Promise<{ message: string }> {
    const response = await this.api.post(`/posts/comments/${commentId}/report`, {
      target_type: 'comment',
      target_id: commentId,
      ...data
    });
    return response.data;
  }

  // Moderation endpoints (admin/moderator only)
  async getReports(status?: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Report>> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);

    const response = await this.api.get(`/moderation/reports?${params}`);
    return response.data;
  }

  async resolveReport(reportId: number, action: 'approve' | 'dismiss', notes?: string): Promise<{ message: string }> {
    const response = await this.api.put(`/moderation/reports/${reportId}/resolve`, { action, notes });
    return response.data;
  }

  async getModerationStats(): Promise<ModerationStats> {
    const response = await this.api.get('/moderation/stats');
    return response.data.stats;
  }

  async suspendUser(userId: number, reason: string): Promise<{ message: string }> {
    const response = await this.api.post(`/moderation/users/${userId}/suspend`, { reason });
    return response.data;
  }

  async reinstateUser(userId: number): Promise<{ message: string }> {
    const response = await this.api.post(`/moderation/users/${userId}/reinstate`);
    return response.data;
  }

  async getAllUsers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<UserProfile>> {
    const response = await this.api.get(`/users/admin/all?page=${page}&limit=${limit}`);
    return response.data;
  }

  async updateUserRole(userId: number, role: string): Promise<{ message: string }> {
    const response = await this.api.put(`/users/${userId}/role`, { role });
    return response.data;
  }

  async updateUserStatus(userId: number, status: string): Promise<{ message: string }> {
    const response = await this.api.put(`/users/${userId}/status`, { status });
    return response.data;
  }

  // Marketplace endpoints
  async createGig(data: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    tags: string[];
    pricing_type: 'fixed' | 'hourly';
    price: number;
    delivery_time: number;
    revisions: number;
    requirements: string[];
    features: string[];
    images: string[];
  }): Promise<{ gig: any }> {
    const response = await this.api.post('/marketplace/gigs', data);
    return response.data;
  }

  async getGigs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    deliveryTime?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    freelancer_id?: number;
  }): Promise<{ gigs: any[]; pagination: any }> {
    const response = await this.api.get('/marketplace/gigs', { params });
    return response.data;
  }

  async getGig(gigId: number): Promise<{ gig: any }> {
    const response = await this.api.get(`/marketplace/gigs/${gigId}`);
    return response.data;
  }

  async updateGig(gigId: number, data: Partial<{
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    tags: string[];
    pricing_type: 'fixed' | 'hourly';
    price: number;
    delivery_time: number;
    revisions: number;
    requirements: string[];
    features: string[];
    images: string[];
    status: string;
  }>): Promise<{ gig: any }> {
    const response = await this.api.put(`/marketplace/gigs/${gigId}`, data);
    return response.data;
  }

  async deleteGig(gigId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/marketplace/gigs/${gigId}`);
    return response.data;
  }

  async sendMessage(data: {
    receiver_id: number;
    gig_id?: number;
    contract_id?: number;
    content: string;
    message_type?: 'text' | 'image' | 'file' | 'system';
    file_url?: string;
    file_name?: string;
    file_size?: number;
  }): Promise<{ message: any }> {
    const response = await this.api.post('/marketplace/messages', data);
    return response.data;
  }

  async getMessages(params?: {
    other_user_id?: number;
    gig_id?: number;
    contract_id?: number;
    page?: number;
    limit?: number;
  }): Promise<{ messages: any[]; pagination: any }> {
    const response = await this.api.get('/marketplace/messages', { params });
    return response.data;
  }

  async getConversations(): Promise<{ conversations: any[] }> {
    const response = await this.api.get('/marketplace/conversations');
    return response.data;
  }

  async createContract(data: {
    gig_id: number;
    freelancer_id: number;
    title: string;
    description: string;
    price: number;
    delivery_time: number;
    requirements: string[];
    deliverables: string[];
  }): Promise<{ contract: any }> {
    const response = await this.api.post('/marketplace/contracts', data);
    return response.data;
  }

  async getContracts(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ contracts: any[]; pagination: any }> {
    const response = await this.api.get('/marketplace/contracts', { params });
    return response.data;
  }

  async updateContractStatus(contractId: number, status: string, notes?: string): Promise<{ contract: any }> {
    const response = await this.api.put(`/marketplace/contracts/${contractId}/status`, { status, notes });
    return response.data;
  }

  // Job endpoints
  async createJob(data: {
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    tags: string[];
    job_type: 'fixed' | 'hourly';
    budget_min?: number;
    budget_max?: number;
    fixed_price?: number;
    estimated_hours?: number;
    experience_level: 'entry' | 'intermediate' | 'expert';
    duration: 'short' | 'medium' | 'long';
    deadline?: string;
    requirements: string[];
    preferred_skills: string[];
  }): Promise<{ job: any }> {
    const response = await this.api.post('/jobs', data);
    return response.data;
  }

  async getJobs(params?: {
    page?: number;
    limit?: number;
    category?: string;
    experience_level?: string;
    job_type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ jobs: any[]; pagination: any }> {
    const response = await this.api.get('/jobs', { params });
    return response.data;
  }

  async getJob(jobId: number): Promise<{ job: any }> {
    const response = await this.api.get(`/jobs/${jobId}`);
    return response.data;
  }

  async updateJob(jobId: number, data: Partial<{
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    tags: string[];
    job_type: 'fixed' | 'hourly';
    budget_min?: number;
    budget_max?: number;
    fixed_price?: number;
    estimated_hours?: number;
    experience_level: 'entry' | 'intermediate' | 'expert';
    duration: 'short' | 'medium' | 'long';
    deadline?: string;
    requirements: string[];
    preferred_skills: string[];
    status: string;
  }>): Promise<{ job: any }> {
    const response = await this.api.put(`/jobs/${jobId}`, data);
    return response.data;
  }

  async deleteJob(jobId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/jobs/${jobId}`);
    return response.data;
  }

  // Freelancer/Talent endpoints
  async getFreelancers(params?: {
    page?: number;
    limit?: number;
    skill?: string;
    experience_level?: string;
    location?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ freelancers: any[]; pagination: any }> {
    const response = await this.api.get('/users/freelancers', { params });
    return response.data;
  }

  async getFreelancer(userId: number): Promise<{ user: any }> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  // User-specific job endpoints
  async getMyPostedJobs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ jobs: any[]; pagination: any }> {
    const response = await this.api.get('/jobs/my-posted', { params });
    return response.data;
  }

  async getMyContracts(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{ contracts: any[]; pagination: any }> {
    const response = await this.api.get('/marketplace/contracts/my-contracts', { params });
    return response.data;
  }

  // Portfolio endpoints
  async getMyPortfolios(): Promise<{ portfolios: any[] }> {
    const response = await this.api.get('/portfolio/my-portfolios');
    return response.data;
  }

  async getPortfolios(params?: {
    page?: number;
    limit?: number;
    userId?: number;
  }): Promise<{ portfolios: any[]; total: number; page: number; totalPages: number }> {
    const response = await this.api.get('/portfolio', { params });
    return response.data;
  }

  async getPortfolio(portfolioId: number): Promise<{ portfolio: any }> {
    const response = await this.api.get(`/portfolio/${portfolioId}`);
    return response.data;
  }

  async createPortfolio(data: {
    title: string;
    description: string;
    image_url?: string;
    link_url?: string;
    category?: string;
    technologies?: string[];
  }): Promise<{ portfolio: any }> {
    const response = await this.api.post('/portfolio', data);
    return response.data;
  }

  async updatePortfolio(portfolioId: number, data: {
    title?: string;
    description?: string;
    image_url?: string;
    link_url?: string;
    category?: string;
    technologies?: string[];
  }): Promise<{ portfolio: any }> {
    const response = await this.api.put(`/portfolio/${portfolioId}`, data);
    return response.data;
  }

  async deletePortfolio(portfolioId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/portfolio/${portfolioId}`);
    return response.data;
  }

  // Job Application endpoints
  async applyForJob(data: {
    job_id: number;
    cover_letter: string;
    proposed_rate?: number;
    proposed_hours?: number;
    estimated_completion?: string;
  }): Promise<{ application: any; message: string }> {
    const response = await this.api.post('/job-applications', data);
    return response.data;
  }

  async getMyJobApplications(): Promise<{ applications: any[] }> {
    const response = await this.api.get('/job-applications/my-applications');
    return response.data;
  }

  async getJobApplications(jobId: number): Promise<{ applications: any[] }> {
    const response = await this.api.get(`/job-applications/job/${jobId}`);
    return response.data;
  }

  // Auth enhancements
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await this.api.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(refreshToken?: string): Promise<{ message: string }> {
    const response = await this.api.post('/auth/logout', { refreshToken });
    return response.data;
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.get(`/auth/verify-email?token=${token}`);
    return response.data;
  }

  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post('/auth/resend-verification', { email });
    return response.data;
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await this.api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  }

  // Job hire
  async hireFreelancer(jobId: number, applicationId: number): Promise<{ success: boolean; message: string; application: any; job: any }> {
    const response = await this.api.post(`/jobs/${jobId}/hire`, { application_id: applicationId });
    return response.data;
  }

  // Payment endpoints
  async getWalletBalance(): Promise<{ success: boolean; balance: number; pending_balance: number; total_earned: number; total_withdrawn: number; available_balance: number; total_balance: number }> {
    const response = await this.api.get('/payments/wallet/balance');
    return response.data;
  }

  async createEscrowPayment(contractId: number, amount: number): Promise<{ success: boolean; transaction: any; message: string }> {
    const response = await this.api.post('/payments/escrow', { contract_id: contractId, amount });
    return response.data;
  }

  async releaseEscrowPayment(contractId: number): Promise<{ success: boolean; transaction: any; message: string }> {
    const response = await this.api.post(`/payments/escrow/${contractId}/release`);
    return response.data;
  }

  async refundEscrowPayment(contractId: number, reason: string): Promise<{ success: boolean; transaction: any; message: string }> {
    const response = await this.api.post(`/payments/escrow/${contractId}/refund`, { reason });
    return response.data;
  }

  async getTransactionHistory(page: number = 1, limit: number = 20): Promise<{ success: boolean; transactions: any[]; pagination: any }> {
    const response = await this.api.get('/payments/transactions', { params: { page, limit } });
    return response.data;
  }

  async createWithdrawal(amount: number, method: string, accountDetails: Record<string, any>): Promise<{ success: boolean; withdrawal: any; message: string }> {
    const response = await this.api.post('/payments/withdrawals', { amount, method, account_details: accountDetails });
    return response.data;
  }

  async getWithdrawalHistory(page: number = 1, limit: number = 20): Promise<{ success: boolean; withdrawals: any[]; pagination: any }> {
    const response = await this.api.get('/payments/withdrawals', { params: { page, limit } });
    return response.data;
  }

  // Review endpoints
  async createContractReview(contractId: number, rating: number, comment: string): Promise<{ success: boolean; review: any; message: string }> {
    const response = await this.api.post('/reviews/contracts', { contract_id: contractId, rating, comment });
    return response.data;
  }

  async createJobReview(jobId: number, revieweeId: number, rating: number, comment: string): Promise<{ success: boolean; review: any; message: string }> {
    const response = await this.api.post('/reviews/jobs', { job_id: jobId, reviewee_id: revieweeId, rating, comment });
    return response.data;
  }

  async createGigReview(gigId: number, revieweeId: number, rating: number, comment: string): Promise<{ success: boolean; review: any; message: string }> {
    const response = await this.api.post('/reviews/gigs', { gig_id: gigId, reviewee_id: revieweeId, rating, comment });
    return response.data;
  }

  async getUserReviews(userId: number, page: number = 1, limit: number = 20): Promise<{ success: boolean; reviews: any[]; averageRating: number; totalReviews: number; pagination: any }> {
    const response = await this.api.get(`/reviews/users/${userId}`, { params: { page, limit } });
    return response.data;
  }

  async getContractReviews(contractId: number): Promise<{ success: boolean; reviews: any[] }> {
    const response = await this.api.get(`/reviews/contracts/${contractId}`);
    return response.data;
  }

  // Notification endpoints
  async getNotifications(page: number = 1, limit: number = 20, unreadOnly: boolean = false): Promise<{ success: boolean; notifications: any[]; unreadCount: number; pagination: any }> {
    const response = await this.api.get('/notifications', { params: { page, limit, unreadOnly } });
    return response.data;
  }

  async getUnreadNotificationCount(): Promise<{ success: boolean; unreadCount: number }> {
    const response = await this.api.get('/notifications/unread-count');
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    const response = await this.api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await this.api.put('/notifications/read-all');
    return response.data;
  }

  async deleteNotification(notificationId: number): Promise<{ success: boolean; message: string }> {
    const response = await this.api.delete(`/notifications/${notificationId}`);
    return response.data;
  }

  // Upload endpoints
  async uploadImage(file: File): Promise<{ success: boolean; url: string; filename: string }> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await this.api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadImages(files: File[]): Promise<{ success: boolean; urls: string[]; count: number }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    const response = await this.api.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboardStats(): Promise<{ success: boolean; stats: any }> {
    const response = await this.api.get('/admin/analytics/overview');
    return response.data;
  }

  async getAdminJobs(page: number = 1, limit: number = 20, filters?: any): Promise<{ success: boolean; jobs: any[]; pagination: any }> {
    const response = await this.api.get('/admin/jobs', { params: { page, limit, ...filters } });
    return response.data;
  }

  async getAdminGigs(page: number = 1, limit: number = 20, filters?: any): Promise<{ success: boolean; gigs: any[]; pagination: any }> {
    const response = await this.api.get('/admin/gigs', { params: { page, limit, ...filters } });
    return response.data;
  }

  async getAdminContracts(page: number = 1, limit: number = 20, filters?: any): Promise<{ success: boolean; contracts: any[]; pagination: any }> {
    const response = await this.api.get('/admin/contracts', { params: { page, limit, ...filters } });
    return response.data;
  }

  async getAdminTransactions(page: number = 1, limit: number = 20, filters?: any): Promise<{ success: boolean; transactions: any[]; pagination: any }> {
    const response = await this.api.get('/admin/transactions', { params: { page, limit, ...filters } });
    return response.data;
  }

  async getAdminTransactionStats(): Promise<{ success: boolean; stats: any }> {
    const response = await this.api.get('/admin/transactions/stats');
    return response.data;
  }

  async getAdminWithdrawals(page: number = 1, limit: number = 20, filters?: any): Promise<{ success: boolean; withdrawals: any[]; pagination: any }> {
    const response = await this.api.get('/admin/withdrawals', { params: { page, limit, ...filters } });
    return response.data;
  }
}

export const apiService = new ApiService();
