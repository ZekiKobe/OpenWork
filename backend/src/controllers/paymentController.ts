import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { AuthenticatedRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

export class PaymentController {
  /**
   * Get wallet balance
   */
  static async getWalletBalance(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const balance = await PaymentService.getWalletBalance(req.user.id);
      res.json({ success: true, ...balance });
    } catch (error: any) {
      console.error('Get wallet balance error:', error);
      res.status(500).json({ error: error.message || 'Failed to get wallet balance' });
    }
  }

  /**
   * Create escrow payment
   */
  static async createEscrowPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { contract_id, amount } = req.body;

      const transaction = await PaymentService.createEscrowPayment(
        req.user.id,
        contract_id,
        amount
      );

      res.status(201).json({
        success: true,
        transaction,
        message: 'Payment placed in escrow'
      });
    } catch (error: any) {
      console.error('Create escrow payment error:', error);
      res.status(400).json({ error: error.message || 'Failed to create escrow payment' });
    }
  }

  /**
   * Release escrow payment
   */
  static async releaseEscrowPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const contractId = parseInt(id, 10);

      // Check if user is client or admin
      const releasedBy = req.user.role === 'admin' ? 'admin' : 'client';

      const transaction = await PaymentService.releaseEscrowPayment(contractId, releasedBy);

      res.json({
        success: true,
        transaction,
        message: 'Payment released successfully'
      });
    } catch (error: any) {
      console.error('Release escrow payment error:', error);
      res.status(400).json({ error: error.message || 'Failed to release payment' });
    }
  }

  /**
   * Refund escrow payment
   */
  static async refundEscrowPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { id } = req.params;
      const { reason } = req.body;
      const contractId = parseInt(id, 10);

      const transaction = await PaymentService.refundEscrowPayment(contractId, reason || 'Refund requested');

      res.json({
        success: true,
        transaction,
        message: 'Payment refunded successfully'
      });
    } catch (error: any) {
      console.error('Refund escrow payment error:', error);
      res.status(400).json({ error: error.message || 'Failed to refund payment' });
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await PaymentService.getTransactionHistory(req.user.id, page, limit);

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get transaction history error:', error);
      res.status(500).json({ error: error.message || 'Failed to get transaction history' });
    }
  }

  /**
   * Create withdrawal request
   */
  static async createWithdrawal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { amount, method, account_details } = req.body;

      const withdrawal = await PaymentService.createWithdrawal(
        req.user.id,
        amount,
        method,
        account_details
      );

      res.status(201).json({
        success: true,
        withdrawal,
        message: 'Withdrawal request submitted'
      });
    } catch (error: any) {
      console.error('Create withdrawal error:', error);
      res.status(400).json({ error: error.message || 'Failed to create withdrawal' });
    }
  }

  /**
   * Get withdrawal history
   */
  static async getWithdrawalHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await PaymentService.getWithdrawalHistory(req.user.id, page, limit);

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Get withdrawal history error:', error);
      res.status(500).json({ error: error.message || 'Failed to get withdrawal history' });
    }
  }

  /**
   * Process withdrawal (admin only)
   */
  static async processWithdrawal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
      }

      const { id } = req.params;
      const { status, rejection_reason } = req.body;
      const withdrawalId = parseInt(id, 10);

      const withdrawal = await PaymentService.processWithdrawal(
        withdrawalId,
        status,
        rejection_reason
      );

      res.json({
        success: true,
        withdrawal,
        message: `Withdrawal ${status}`
      });
    } catch (error: any) {
      console.error('Process withdrawal error:', error);
      res.status(400).json({ error: error.message || 'Failed to process withdrawal' });
    }
  }
}

export const createEscrowPaymentValidators = [
  body('contract_id').isInt().withMessage('Valid contract ID required'),
  body('amount').isFloat({ min: 5.00 }).withMessage('Amount must be at least $5.00')
];

export const createWithdrawalValidators = [
  body('amount').isFloat({ min: 10.00 }).withMessage('Minimum withdrawal is $10.00'),
  body('method').isIn(['bank_transfer', 'paypal', 'stripe', 'crypto']).withMessage('Valid withdrawal method required'),
  body('account_details').isObject().withMessage('Account details required')
];
