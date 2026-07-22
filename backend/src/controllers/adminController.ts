import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '../models/User';
import { AdminService } from '../services/adminService';

export class AdminController {
  /**
   * Get dashboard overview statistics
   */
  static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getDashboardStats();
      res.json({ success: true, stats });
    } catch (error: any) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get dashboard stats' });
    }
  }

  /**
   * Get all jobs (admin)
   */
  static async getAllJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string,
        search: req.query.search as string
      };

      const result = await AdminService.getAllJobs(page, limit, filters);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get all jobs error:', error);
      res.status(500).json({ error: error.message || 'Failed to get jobs' });
    }
  }

  /**
   * Get all gigs (admin)
   */
  static async getAllGigs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as string,
        category: req.query.category as string,
        search: req.query.search as string
      };

      const result = await AdminService.getAllGigs(page, limit, filters);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get all gigs error:', error);
      res.status(500).json({ error: error.message || 'Failed to get gigs' });
    }
  }

  /**
   * Get all contracts (admin)
   */
  static async getAllContracts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        contract_status: req.query.contract_status as string,
        payment_status: req.query.payment_status as string
      };

      const result = await AdminService.getAllContracts(page, limit, filters);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get all contracts error:', error);
      res.status(500).json({ error: error.message || 'Failed to get contracts' });
    }
  }

  /**
   * Get all transactions (admin)
   */
  static async getAllTransactions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        transaction_type: req.query.transaction_type as string,
        status: req.query.status as string,
        date_from: req.query.date_from as string,
        date_to: req.query.date_to as string
      };

      const result = await AdminService.getAllTransactions(page, limit, filters);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get all transactions error:', error);
      res.status(500).json({ error: error.message || 'Failed to get transactions' });
    }
  }

  /**
   * Get all withdrawals (admin)
   */
  static async getAllWithdrawals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        status: req.query.status as string,
        method: req.query.method as string
      };

      const result = await AdminService.getAllWithdrawals(page, limit, filters);
      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get all withdrawals error:', error);
      res.status(500).json({ error: error.message || 'Failed to get withdrawals' });
    }
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getTransactionStats();
      res.json({ success: true, stats });
    } catch (error: any) {
      console.error('Get transaction stats error:', error);
      res.status(500).json({ error: error.message || 'Failed to get transaction stats' });
    }
  }
}
