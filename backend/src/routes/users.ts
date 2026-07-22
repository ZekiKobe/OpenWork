import { Router } from 'express';
import { UserController, updateProfileValidators } from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Public routes
router.get('/freelancers', UserController.getFreelancers);
router.get('/search', UserController.searchUsers);
router.get('/:username', UserController.getPublicProfile);

// Protected routes (require authentication)
router.use(authenticate);
router.get('/id/:id', UserController.getUserById);
router.get('/', UserController.getProfile);
router.put('/', updateProfileValidators, UserController.updateProfile);

// Admin routes
router.get('/admin/all', requireRole(UserRole.ADMIN, UserRole.MODERATOR), UserController.getAllUsers);
router.put('/:userId/role', requireRole(UserRole.ADMIN), UserController.updateUserRole);
router.put('/:userId/status', requireRole(UserRole.ADMIN, UserRole.MODERATOR), UserController.updateUserStatus);

export default router;
