import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// All admin routes require authentication and admin/moderator role
router.use(authenticate);
router.use(requireRole(UserRole.ADMIN, UserRole.MODERATOR));

// Dashboard
router.get('/analytics/overview', AdminController.getDashboardStats);

// Management endpoints
router.get('/jobs', AdminController.getAllJobs);
router.get('/gigs', AdminController.getAllGigs);
router.get('/contracts', AdminController.getAllContracts);
router.get('/transactions', AdminController.getAllTransactions);
router.get('/transactions/stats', AdminController.getTransactionStats);
router.get('/withdrawals', AdminController.getAllWithdrawals);

export default router;
