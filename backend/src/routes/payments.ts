import { Router } from 'express';
import { PaymentController, createEscrowPaymentValidators, createWithdrawalValidators } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/wallet/balance', PaymentController.getWalletBalance);
router.get('/status', PaymentController.getPaymentsStatus);
router.post('/deposit', PaymentController.createDeposit);

router.post('/escrow', createEscrowPaymentValidators, PaymentController.createEscrowPayment);
router.post('/escrow/:id/release', PaymentController.releaseEscrowPayment);
router.post('/escrow/:id/refund', PaymentController.refundEscrowPayment);

router.get('/transactions', PaymentController.getTransactionHistory);

router.post('/withdrawals', createWithdrawalValidators, PaymentController.createWithdrawal);
router.get('/withdrawals', PaymentController.getWithdrawalHistory);
router.put('/withdrawals/:id/process', PaymentController.processWithdrawal);

export default router;
