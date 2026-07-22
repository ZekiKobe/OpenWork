import { Router } from 'express';
import { AuthController, registerValidators, loginValidators } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { loginLimiter, registerLimiter } from '../middleware/rateLimit';

const router = Router();

// POST /auth/register
router.post('/register', registerLimiter, registerValidators, AuthController.register);

// POST /auth/login
router.post('/login', loginLimiter, loginValidators, AuthController.login);

// GET /auth/me
router.get('/me', authenticate, AuthController.getCurrentUser);

// POST /auth/refresh
router.post('/refresh', AuthController.refreshToken);

// POST /auth/logout
router.post('/logout', authenticate, AuthController.logout);

// Email verification
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationEmail);

// Password reset
router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

export default router;
