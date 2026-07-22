import { Op } from 'sequelize';
import User, { UserRole, UserStatus } from '../models/User';
import Job, { JobStatus } from '../models/Job';
import Gig, { GigStatus } from '../models/Gig';
import Contract, { ContractStatus, PaymentStatus } from '../models/Contract';
import Transaction, { TransactionType, TransactionStatus } from '../models/Transaction';
import Withdrawal, { WithdrawalStatus } from '../models/Withdrawal';
import Report, { ReportStatus } from '../models/Report';
import Wallet from '../models/Wallet';

export class AdminService {
  /**
   * Get dashboard overview statistics
   */
  static async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      activeJobs,
      activeGigs,
      totalContracts,
      pendingWithdrawals,
      pendingReports,
      activeDisputes,
      platformRevenueResult,
      totalTransactions
    ] = await Promise.all([
      User.count(),
      User.count({ where: { status: UserStatus.ACTIVE } }),
      Job.count({ where: { status: JobStatus.OPEN } }),
      Gig.count({ where: { status: GigStatus.ACTIVE } }),
      Contract.count(),
      Withdrawal.count({ where: { status: WithdrawalStatus.PENDING } }),
      Report.count({ where: { status: ReportStatus.PENDING } }),
      Contract.count({ where: { contract_status: ContractStatus.DISPUTED } }),
      Transaction.sum('amount', {
        where: {
          transaction_type: TransactionType.ESCROW_RELEASE,
          status: TransactionStatus.COMPLETED
        }
      }),
      Transaction.count()
    ]);

    const platformRevenue = platformRevenueResult ? parseFloat(platformRevenueResult.toString()) : 0;

    // Calculate user growth (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsersLastMonth = await User.count({
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    const totalUsersBefore = totalUsers - newUsersLastMonth;
    const userGrowth = totalUsersBefore > 0 
      ? ((newUsersLastMonth / totalUsersBefore) * 100).toFixed(1)
      : '0';

    // Calculate revenue growth
    const revenueLastMonthResult = await Transaction.sum('amount', {
      where: {
        transaction_type: TransactionType.ESCROW_RELEASE,
        status: TransactionStatus.COMPLETED,
        created_at: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });
    const revenueLastMonth = revenueLastMonthResult ? parseFloat(revenueLastMonthResult.toString()) : 0;
    const revenueBefore = platformRevenue - revenueLastMonth;
    const revenueGrowth = revenueBefore > 0
      ? ((revenueLastMonth / revenueBefore) * 100).toFixed(1)
      : '0';

    return {
      total_users: totalUsers,
      active_users: activeUsers,
      active_jobs: activeJobs,
      active_gigs: activeGigs,
      total_contracts: totalContracts,
      platform_revenue: platformRevenue,
      pending_withdrawals: pendingWithdrawals,
      pending_reports: pendingReports,
      active_disputes: activeDisputes,
      total_transactions: totalTransactions,
      user_growth: parseFloat(userGrowth),
      revenue_growth: parseFloat(revenueGrowth)
    };
  }

  /**
   * Get all jobs (admin view)
   */
  static async getAllJobs(page: number = 1, limit: number = 20, filters?: any) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const { count, rows } = await Job.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'client',
        attributes: ['id', 'username', 'email']
      }]
    });

    return {
      jobs: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get all gigs (admin view)
   */
  static async getAllGigs(page: number = 1, limit: number = 20, filters?: any) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } }
      ];
    }

    const { count, rows } = await Gig.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'freelancer',
        attributes: ['id', 'username', 'email']
      }]
    });

    return {
      gigs: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get all contracts (admin view)
   */
  static async getAllContracts(page: number = 1, limit: number = 20, filters?: any) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters?.contract_status) where.contract_status = filters.contract_status;
    if (filters?.payment_status) where.payment_status = filters.payment_status;

    const { count, rows } = await Contract.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'client',
          attributes: ['id', 'username', 'email']
        },
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    return {
      contracts: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get all transactions (admin view)
   */
  static async getAllTransactions(page: number = 1, limit: number = 20, filters?: any) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters?.transaction_type) where.transaction_type = filters.transaction_type;
    if (filters?.status) where.status = filters.status;
    if (filters?.date_from || filters?.date_to) {
      where.created_at = {};
      if (filters.date_from) where.created_at[Op.gte] = new Date(filters.date_from);
      if (filters.date_to) where.created_at[Op.lte] = new Date(filters.date_to);
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    });

    return {
      transactions: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get all withdrawals (admin view)
   */
  static async getAllWithdrawals(page: number = 1, limit: number = 20, filters?: any) {
    const offset = (page - 1) * limit;
    const where: any = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.method) where.method = filters.method;

    const { count, rows } = await Withdrawal.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        attributes: ['id', 'username', 'email']
      }]
    });

    return {
      withdrawals: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats() {
    const [
      totalRevenueResult,
      totalTransactions,
      pendingTransactions,
      completedTransactions,
      totalFeesResult
    ] = await Promise.all([
      Transaction.sum('amount', {
        where: {
          transaction_type: TransactionType.ESCROW_RELEASE,
          status: TransactionStatus.COMPLETED
        }
      }),
      Transaction.count(),
      Transaction.count({ where: { status: TransactionStatus.PENDING } }),
      Transaction.count({ where: { status: TransactionStatus.COMPLETED } }),
      Transaction.sum('fee', {
        where: {
          status: TransactionStatus.COMPLETED
        }
      })
    ]);

    const totalRevenue = totalRevenueResult ? parseFloat(totalRevenueResult.toString()) : 0;
    const totalFees = totalFeesResult ? parseFloat(totalFeesResult.toString()) : 0;

    return {
      total_revenue: totalRevenue,
      total_transactions: totalTransactions,
      pending_transactions: pendingTransactions,
      completed_transactions: completedTransactions,
      total_fees: totalFees
    };
  }
}
