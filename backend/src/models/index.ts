import { sequelize } from '../config/database';
import User from './User';
import Post from './Post';
import Comment from './Comment';
import Like from './Like';
import PointsLog from './PointsLog';
import Report from './Report';
import Gig from './Gig';
import Message from './Message';
import Contract from './Contract';
import Job from './Job';
import JobApplication from './JobApplication';
import Portfolio from './Portfolio';
import Wallet from './Wallet';
import Transaction from './Transaction';
import Withdrawal from './Withdrawal';
import Notification from './Notification';
import Review from './Review';
import EmailVerification from './EmailVerification';
import PasswordReset from './PasswordReset';
import RefreshToken from './RefreshToken';
import Milestone from './Milestone';

// Define associations

// User associations
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
User.hasMany(Like, { foreignKey: 'user_id', as: 'likes' });
User.hasMany(PointsLog, { foreignKey: 'user_id', as: 'pointsLogs' });
User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reports' });
User.hasMany(Report, { foreignKey: 'moderator_id', as: 'moderatedReports' });

// Marketplace associations
User.hasMany(Gig, { foreignKey: 'freelancer_id', as: 'gigs' });
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
User.hasMany(Contract, { foreignKey: 'client_id', as: 'clientContracts' });
User.hasMany(Contract, { foreignKey: 'freelancer_id', as: 'freelancerContracts' });

// Job associations
User.hasMany(Job, { foreignKey: 'client_id', as: 'postedJobs' });
User.hasMany(JobApplication, { foreignKey: 'freelancer_id', as: 'jobApplications' });

// Post associations
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });

// Comment associations
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });
Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });

// Like associations
Like.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// PointsLog associations
PointsLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Report associations
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'moderator_id', as: 'moderator' });

// Gig associations
Gig.belongsTo(User, { foreignKey: 'freelancer_id', as: 'freelancer' });
Gig.hasMany(Message, { foreignKey: 'gig_id', as: 'messages' });
Gig.hasMany(Contract, { foreignKey: 'gig_id', as: 'contracts' });

// Message associations
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });
Message.belongsTo(Gig, { foreignKey: 'gig_id', as: 'gig' });
Message.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });

// Contract associations
Contract.belongsTo(Gig, { foreignKey: 'gig_id', as: 'gig' });
Contract.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
Contract.belongsTo(User, { foreignKey: 'freelancer_id', as: 'freelancer' });
Contract.hasMany(Message, { foreignKey: 'contract_id', as: 'messages' });

// Job associations
Job.belongsTo(User, { foreignKey: 'client_id', as: 'client' });
Job.hasMany(JobApplication, { foreignKey: 'job_id', as: 'applications' });

// JobApplication associations
JobApplication.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
JobApplication.belongsTo(User, { foreignKey: 'freelancer_id', as: 'freelancer' });

// Portfolio associations
Portfolio.belongsTo(User, { foreignKey: 'user_id', as: 'portfolioUser' });
User.hasMany(Portfolio, { foreignKey: 'user_id', as: 'userPortfolios' });

// Wallet associations
Wallet.belongsTo(User, { foreignKey: 'user_id', as: 'walletUser' });
User.hasOne(Wallet, { foreignKey: 'user_id', as: 'wallet' });
Wallet.hasMany(Transaction, { foreignKey: 'wallet_id', as: 'transactions' });
Wallet.hasMany(Withdrawal, { foreignKey: 'wallet_id', as: 'withdrawals' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'transactionUser' });
Transaction.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
Transaction.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });
Transaction.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });

// Withdrawal associations
Withdrawal.belongsTo(User, { foreignKey: 'user_id', as: 'withdrawalUser' });
Withdrawal.belongsTo(Wallet, { foreignKey: 'wallet_id', as: 'wallet' });
User.hasMany(Withdrawal, { foreignKey: 'user_id', as: 'withdrawals' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'notificationUser' });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });

// Review associations
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });
Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' });
Review.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });
Review.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Review.belongsTo(Gig, { foreignKey: 'gig_id', as: 'gig' });
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'reviewsGiven' });
User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'reviewsReceived' });
Contract.hasMany(Review, { foreignKey: 'contract_id', as: 'reviews' });
Job.hasMany(Review, { foreignKey: 'job_id', as: 'reviews' });
Gig.hasMany(Review, { foreignKey: 'gig_id', as: 'reviews' });

// Email Verification associations
EmailVerification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(EmailVerification, { foreignKey: 'user_id', as: 'emailVerifications' });

// Password Reset associations
PasswordReset.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(PasswordReset, { foreignKey: 'user_id', as: 'passwordResets' });

// Refresh Token associations
RefreshToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(RefreshToken, { foreignKey: 'user_id', as: 'refreshTokens' });

// Milestone associations
Milestone.belongsTo(Job, { foreignKey: 'job_id', as: 'job' });
Milestone.belongsTo(Contract, { foreignKey: 'contract_id', as: 'contract' });
Job.hasMany(Milestone, { foreignKey: 'job_id', as: 'milestones' });
Contract.hasMany(Milestone, { foreignKey: 'contract_id', as: 'milestones' });

export {
  sequelize,
  User,
  Post,
  Comment,
  Like,
  PointsLog,
  Report,
  Gig,
  Message,
  Contract,
  Job,
  JobApplication,
  Portfolio,
  Wallet,
  Transaction,
  Withdrawal,
  Notification,
  Review,
  EmailVerification,
  PasswordReset,
  RefreshToken,
  Milestone
};
