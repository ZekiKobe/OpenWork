import { Router } from 'express';
import { AuthController, registerValidators, loginValidators, changePasswordValidators } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { loginLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimit';

const router = Router();

// POST /auth/register
router.post('/register', registerLimiter, registerValidators, AuthController.register);

// POST /auth/login
router.post('/login', loginLimiter, loginValidators, AuthController.login);

// POST /auth/google
router.post('/google', loginLimiter, AuthController.googleLogin);

// GET /auth/me
router.get('/me', authenticate, AuthController.getCurrentUser);

// POST /auth/refresh
router.post('/refresh', AuthController.refreshToken);

// POST /auth/logout
router.post('/logout', authenticate, AuthController.logout);

// Email verification
router.get('/verify-email', AuthController.verifyEmail);
router.post('/resend-verification', passwordResetLimiter, AuthController.resendVerificationEmail);

// Password reset
router.post('/forgot-password', passwordResetLimiter, AuthController.requestPasswordReset);
router.post('/reset-password', passwordResetLimiter, AuthController.resetPassword);

// Change password (authenticated)
router.post('/change-password', authenticate, changePasswordValidators, AuthController.changePassword);

export default router;
