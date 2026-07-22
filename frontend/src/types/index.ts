// User types
export const UserRole = {
  USER: 'user',
  FREELANCER: 'freelancer',
  CLIENT: 'client',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const UserStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended'
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export interface User {
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
  rating?: number;
  created_at: string;
}

export interface UserProfile extends User {
  stats: {
    posts_count: number;
    comments_count: number;
    likes_given: number;
    likes_received: number;
  };
}

export interface PortfolioItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  category?: string;
  technologies?: string[];
  created_at: string;
  updated_at: string;
  user: {
    username: string;
    avatar_url?: string;
  };
}

export interface CreatePortfolioData {
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  category?: string;
  technologies: string[];
}

export interface UpdatePortfolioData {
  title?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  category?: string;
  technologies?: string[];
}

// Post types
export interface Post {
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
  created_at: string;
  updated_at: string;
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

// Comment types
export interface Comment {
  id: number;
  content: string;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  replies?: Comment[];
  user_like?: boolean;
}

// Points types
export interface PointsBalance {
  total_points: number;
  today_points: number;
  history: PointsLog[];
}

export interface PointsLog {
  source: string;
  points: number;
  description: string;
  created_at: string;
}

export interface PointsStats {
  total_earned: number;
  total_lost: number;
  posts_created: number;
  likes_received: number;
  comments_made: number;
  helpful_posts: number;
}

// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// Form types
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

// Report types
export const ReportReason = {
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  INAPPROPRIATE_CONTENT: 'inappropriate_content',
  HATE_SPEECH: 'hate_speech',
  MISINFORMATION: 'misinformation',
  OTHER: 'other'
} as const;

export type ReportReason = typeof ReportReason[keyof typeof ReportReason];

export interface CreateReportData {
  target_type: 'post' | 'comment' | 'user';
  target_id: number;
  reason: ReportReason;
  description?: string;
}

// Moderation types
export interface Report {
  id: number;
  reporter: {
    id: number;
    username: string;
  };
  target_type: string;
  target_id: number;
  reason: ReportReason;
  description?: string;
  status: string;
  moderator?: {
    id: number;
    username: string;
  };
  moderator_notes?: string;
  created_at: string;
  updated_at: string;
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

// Marketplace types
export const GigCategory = {
  WEB_DEVELOPMENT: 'web-development',
  MOBILE_DEVELOPMENT: 'mobile-development',
  DESIGN: 'design',
  WRITING: 'writing',
  MARKETING: 'marketing',
  DATA_SCIENCE: 'data-science',
  CONSULTING: 'consulting',
  OTHER: 'other'
} as const;

export type GigCategory = typeof GigCategory[keyof typeof GigCategory];

export const GigStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  DELETED: 'deleted'
} as const;

export type GigStatus = typeof GigStatus[keyof typeof GigStatus];

export interface Gig {
  id: number;
  freelancer_id: number;
  title: string;
  description: string;
  category: GigCategory;
  subcategory?: string;
  tags: string[];
  pricing_type: 'fixed' | 'hourly';
  price: number;
  delivery_time: number;
  revisions: number;
  requirements?: string[];
  features: string[];
  images: string[];
  status: GigStatus;
  rating: number;
  total_reviews: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
  freelancer: {
    id: number;
    username: string;
    avatar_url?: string;
    title?: string;
    company?: string;
    bio?: string;
    location?: string;
    skills?: string[];
  };
}

export const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system'
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

export const MessageStatus = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read'
} as const;

export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  gig_id?: number;
  contract_id?: number;
  content: string;
  message_type: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  status: MessageStatus;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    username: string;
    avatar_url?: string;
  };
  receiver: {
    id: number;
    username: string;
    avatar_url?: string;
  };
}

export const ContractStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  APPROVED: 'approved',
  REVISION_REQUESTED: 'revision_requested',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed'
} as const;

export type ContractStatus = typeof ContractStatus[keyof typeof ContractStatus];

export const PaymentStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  RELEASED: 'released',
  REFUNDED: 'refunded'
} as const;

export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export interface Contract {
  id: number;
  gig_id: number;
  client_id: number;
  freelancer_id: number;
  title: string;
  description: string;
  price: number;
  delivery_time: number;
  revisions_included: number;
  contract_status: ContractStatus;
  payment_status: PaymentStatus;
  started_at?: string;
  deadline?: string;
  completed_at?: string;
  delivered_at?: string;
  approved_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  client_rating?: number;
  freelancer_rating?: number;
  client_review?: string;
  freelancer_review?: string;
  attachments: string[];
  requirements: string[];
  deliverables: string[];
  created_at: string;
  updated_at: string;
  gig: Gig;
  client: User;
  freelancer: User;
}

export interface CreateGigData {
  title: string;
  description: string;
  category: GigCategory;
  subcategory?: string;
  tags: string[];
  pricing_type: 'fixed' | 'hourly';
  price: number;
  delivery_time: number;
  revisions: number;
  requirements: string[];
  features: string[];
  images: string[];
}

export interface CreateContractData {
  gig_id: number;
  freelancer_id: number;
  title: string;
  description: string;
  price: number;
  delivery_time: number;
  requirements: string[];
  deliverables: string[];
}

export interface SendMessageData {
  receiver_id: number;
  gig_id?: number;
  contract_id?: number;
  content: string;
  message_type?: MessageType;
  file_url?: string;
  file_name?: string;
  file_size?: number;
}

export interface Conversation {
  other_user: User;
  last_message: Message;
  unread_count: number;
}

// Wallet & Payment types
export interface Wallet {
  id: number;
  user_id: number;
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface WalletBalance {
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  available_balance: number;
  total_balance: number;
}

export const TransactionType = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PAYMENT: 'payment',
  REFUND: 'refund',
  ESCROW_HOLD: 'escrow_hold',
  ESCROW_RELEASE: 'escrow_release',
  COMMISSION: 'commission',
  TRANSFER: 'transfer'
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const TransactionStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export interface Transaction {
  id: number;
  user_id: number;
  wallet_id: number;
  contract_id?: number;
  job_id?: number;
  transaction_type: TransactionType;
  amount: number;
  fee: number;
  net_amount: number;
  status: TransactionStatus;
  description: string;
  reference?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  contract?: Contract;
  job?: Job;
}

export const WithdrawalMethod = {
  BANK_TRANSFER: 'bank_transfer',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  CRYPTO: 'crypto'
} as const;

export type WithdrawalMethod = typeof WithdrawalMethod[keyof typeof WithdrawalMethod];

export const WithdrawalStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const;

export type WithdrawalStatus = typeof WithdrawalStatus[keyof typeof WithdrawalStatus];

export interface Withdrawal {
  id: number;
  user_id: number;
  wallet_id: number;
  amount: number;
  fee: number;
  net_amount: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  account_details: Record<string, any>;
  rejection_reason?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Notification types
export const NotificationType = {
  MESSAGE: 'message',
  JOB_APPLICATION: 'job_application',
  JOB_ACCEPTED: 'job_accepted',
  CONTRACT_CREATED: 'contract_created',
  CONTRACT_ACCEPTED: 'contract_accepted',
  CONTRACT_COMPLETED: 'contract_completed',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_RELEASED: 'payment_released',
  REVIEW_RECEIVED: 'review_received',
  SYSTEM: 'system'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  read_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Review types
export const ReviewType = {
  CONTRACT: 'contract',
  JOB: 'job',
  GIG: 'gig'
} as const;

export type ReviewType = typeof ReviewType[keyof typeof ReviewType];

export interface Review {
  id: number;
  reviewer_id: number;
  reviewee_id: number;
  contract_id?: number;
  job_id?: number;
  gig_id?: number;
  review_type: ReviewType;
  rating: number;
  comment: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  reviewer?: User;
  reviewee?: User;
  contract?: Contract;
  job?: Job;
  gig?: Gig;
}

export interface UserReviews {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}