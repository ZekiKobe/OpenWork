import { Router } from 'express';
import { PaymentController, createEscrowPaymentValidators, createWithdrawalValidators } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// Wallet
router.get('/wallet/balance', PaymentController.getWalletBalance);

// Escrow
router.post('/escrow', createEscrowPaymentValidators, PaymentController.createEscrowPayment);
router.post('/escrow/:id/release', PaymentController.releaseEscrowPayment);
router.post('/escrow/:id/refund', PaymentController.refundEscrowPayment);

// Transactions
router.get('/transactions', PaymentController.getTransactionHistory);

// Withdrawals
router.post('/withdrawals', createWithdrawalValidators, PaymentController.createWithdrawal);
router.get('/withdrawals', PaymentController.getWithdrawalHistory);
router.put('/withdrawals/:id/process', PaymentController.processWithdrawal); // Admin only

export default router;
