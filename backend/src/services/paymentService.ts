import { Op } from 'sequelize';
import Wallet from '../models/Wallet';
import Transaction, { TransactionType, TransactionStatus } from '../models/Transaction';
import Withdrawal, { WithdrawalStatus, WithdrawalMethod } from '../models/Withdrawal';
import Contract, { ContractStatus, PaymentStatus } from '../models/Contract';
import User from '../models/User';

const PLATFORM_COMMISSION_RATE = 0.10; // 10% commission
const WITHDRAWAL_FEE = 2.00; // Fixed withdrawal fee

export class PaymentService {
  /**
   * Get or create wallet for user
   */
  static async getOrCreateWallet(userId: number): Promise<Wallet> {
    let wallet = await Wallet.findOne({ where: { user_id: userId } });
    
    if (!wallet) {
      wallet = await Wallet.create({
        user_id: userId,
        currency: 'USD',
        balance: 0.00,
        pending_balance: 0.00,
        total_earned: 0.00,
        total_withdrawn: 0.00
      } as any);
    }
    
    return wallet;
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(userId: number) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: parseFloat(wallet.balance.toString()),
      pending_balance: parseFloat(wallet.pending_balance.toString()),
      total_earned: parseFloat(wallet.total_earned.toString()),
      total_withdrawn: parseFloat(wallet.total_withdrawn.toString()),
      available_balance: parseFloat(wallet.balance.toString()),
      total_balance: parseFloat(wallet.totalBalance.toString())
    };
  }

  /**
   * Calculate platform commission
   */
  static calculateCommission(amount: number): { fee: number; netAmount: number } {
    const fee = amount * PLATFORM_COMMISSION_RATE;
    const netAmount = amount - fee;
    return {
      fee: parseFloat(fee.toFixed(2)),
      netAmount: parseFloat(netAmount.toFixed(2))
    };
  }

  /**
   * Create escrow payment (hold funds)
   */
  static async createEscrowPayment(
    clientId: number,
    contractId: number,
    amount: number
  ): Promise<Transaction> {
    const clientWallet = await this.getOrCreateWallet(clientId);
    
    // Check if client has sufficient balance
    if (parseFloat(clientWallet.balance.toString()) < amount) {
      throw new Error('Insufficient balance');
    }

    const { fee, netAmount } = this.calculateCommission(amount);

    // Start transaction
    const dbTransaction = await Wallet.sequelize!.transaction();

    try {
      // Deduct from client balance
      await clientWallet.update(
        {
          balance: parseFloat(clientWallet.balance.toString()) - amount
        },
        { transaction: dbTransaction }
      );

      // Create escrow transaction
      const transaction = await Transaction.create(
        {
          user_id: clientId,
          wallet_id: clientWallet.id,
          contract_id: contractId,
          transaction_type: TransactionType.ESCROW_HOLD,
          amount,
          fee,
          net_amount: netAmount,
          status: TransactionStatus.COMPLETED,
          description: `Escrow payment for contract #${contractId}`
        } as any,
        { transaction: dbTransaction }
      );

      // Update contract payment status
      await Contract.update(
        { payment_status: PaymentStatus.PAID },
        {
          where: { id: contractId },
          transaction: dbTransaction
        }
      );

      await dbTransaction.commit();
      return transaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Release escrow payment to freelancer
   */
  static async releaseEscrowPayment(
    contractId: number,
    releasedBy: 'client' | 'auto' | 'admin'
  ): Promise<Transaction> {
    const contract = await Contract.findByPk(contractId, {
      include: [
        { model: User, as: 'client' },
        { model: User, as: 'freelancer' }
      ]
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.payment_status !== PaymentStatus.PAID) {
      throw new Error('Contract payment not in escrow');
    }

    const freelancerWallet = await this.getOrCreateWallet(contract.freelancer_id);
    const { fee, netAmount } = this.calculateCommission(parseFloat(contract.price.toString()));

    const dbTransaction = await Wallet.sequelize!.transaction();

    try {
      // Add to freelancer wallet
      await freelancerWallet.update(
        {
          balance: parseFloat(freelancerWallet.balance.toString()) + netAmount,
          total_earned: parseFloat(freelancerWallet.total_earned.toString()) + netAmount
        },
        { transaction: dbTransaction }
      );

      // Create release transaction
      const transaction = await Transaction.create(
        {
          user_id: contract.freelancer_id,
          wallet_id: freelancerWallet.id,
          contract_id: contractId,
          transaction_type: TransactionType.ESCROW_RELEASE,
          amount: netAmount,
          fee: 0, // Fee already deducted at escrow
          net_amount: netAmount,
          status: TransactionStatus.COMPLETED,
          description: `Payment released for contract #${contractId} by ${releasedBy}`
        } as any,
        { transaction: dbTransaction }
      );

      // Update contract payment status
      await Contract.update(
        { payment_status: PaymentStatus.RELEASED },
        {
          where: { id: contractId },
          transaction: dbTransaction
        }
      );

      await dbTransaction.commit();
      return transaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Refund escrow payment to client
   */
  static async refundEscrowPayment(
    contractId: number,
    reason: string
  ): Promise<Transaction> {
    const contract = await Contract.findByPk(contractId);

    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.payment_status !== PaymentStatus.PAID) {
      throw new Error('No payment in escrow to refund');
    }

    const clientWallet = await this.getOrCreateWallet(contract.client_id);
    const amount = parseFloat(contract.price.toString());

    const dbTransaction = await Wallet.sequelize!.transaction();

    try {
      // Refund to client
      await clientWallet.update(
        {
          balance: parseFloat(clientWallet.balance.toString()) + amount
        },
        { transaction: dbTransaction }
      );

      // Create refund transaction
      const transaction = await Transaction.create(
        {
          user_id: contract.client_id,
          wallet_id: clientWallet.id,
          contract_id: contractId,
          transaction_type: TransactionType.REFUND,
          amount,
          fee: 0,
          net_amount: amount,
          status: TransactionStatus.COMPLETED,
          description: `Refund for contract #${contractId}: ${reason}`
        } as any,
        { transaction: dbTransaction }
      );

      // Update contract payment status
      await Contract.update(
        { payment_status: PaymentStatus.REFUNDED },
        {
          where: { id: contractId },
          transaction: dbTransaction
        }
      );

      await dbTransaction.commit();
      return transaction;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    userId: number,
    page: number = 1,
    limit: number = 20
  ) {
    const offset = (page - 1) * limit;
    const wallet = await this.getOrCreateWallet(userId);

    const { rows, count } = await Transaction.findAndCountAll({
      where: { wallet_id: wallet.id },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        { model: Contract, as: 'contract', attributes: ['id', 'title'] },
        { model: User, as: 'transactionUser', attributes: ['id', 'username'] }
      ]
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
   * Create withdrawal request
   */
  static async createWithdrawal(
    userId: number,
    amount: number,
    method: WithdrawalMethod,
    accountDetails: Record<string, any>
  ): Promise<Withdrawal> {
    const wallet = await this.getOrCreateWallet(userId);
    const availableBalance = parseFloat(wallet.balance.toString());

    if (availableBalance < amount) {
      throw new Error('Insufficient balance');
    }

    if (amount < 10.00) {
      throw new Error('Minimum withdrawal amount is $10.00');
    }

    const netAmount = amount - WITHDRAWAL_FEE;

    const dbTransaction = await Wallet.sequelize!.transaction();

    try {
      // Deduct from wallet
      await wallet.update(
        {
          balance: availableBalance - amount
        },
        { transaction: dbTransaction }
      );

      // Create withdrawal request
      const withdrawal = await Withdrawal.create(
        {
          user_id: userId,
          wallet_id: wallet.id,
          amount,
          fee: WITHDRAWAL_FEE,
          net_amount: netAmount,
          method,
          status: WithdrawalStatus.PENDING,
          account_details: accountDetails
        } as any,
        { transaction: dbTransaction }
      );

      // Create transaction record
      await Transaction.create(
        {
          user_id: userId,
          wallet_id: wallet.id,
          transaction_type: TransactionType.WITHDRAWAL,
          amount,
          fee: WITHDRAWAL_FEE,
          net_amount: netAmount,
          status: TransactionStatus.PENDING,
          description: `Withdrawal request via ${method}`
        } as any,
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();
      return withdrawal;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Process withdrawal (admin only)
   */
  static async processWithdrawal(
    withdrawalId: number,
    status: 'completed' | 'rejected',
    rejectionReason?: string
  ): Promise<Withdrawal> {
    const withdrawal = await Withdrawal.findByPk(withdrawalId);

    if (!withdrawal) {
      throw new Error('Withdrawal not found');
    }

    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      throw new Error('Withdrawal already processed');
    }

    const dbTransaction = await Wallet.sequelize!.transaction();

    try {
      if (status === 'completed') {
        await withdrawal.update(
          {
            status: WithdrawalStatus.COMPLETED,
            processed_at: new Date()
          },
          { transaction: dbTransaction }
        );

        // Update wallet
        const wallet = await Wallet.findByPk(withdrawal.wallet_id, { transaction: dbTransaction });
        if (wallet) {
          await wallet.update(
            {
              total_withdrawn: parseFloat(wallet.total_withdrawn.toString()) + withdrawal.net_amount
            },
            { transaction: dbTransaction }
          );
        }

        // Update transaction status
        await Transaction.update(
          { status: TransactionStatus.COMPLETED },
          {
            where: {
              user_id: withdrawal.user_id,
              transaction_type: TransactionType.WITHDRAWAL,
              amount: withdrawal.amount
            },
            transaction: dbTransaction
          }
        );
      } else {
        // Refund to wallet
        const wallet = await Wallet.findByPk(withdrawal.wallet_id, { transaction: dbTransaction });
        if (wallet) {
          await wallet.update(
            {
              balance: parseFloat(wallet.balance.toString()) + withdrawal.amount
            },
            { transaction: dbTransaction }
          );
        }

        await withdrawal.update(
          {
            status: WithdrawalStatus.REJECTED,
            rejection_reason: rejectionReason,
            processed_at: new Date()
          },
          { transaction: dbTransaction }
        );

        // Update transaction status
        await Transaction.update(
          { status: TransactionStatus.FAILED },
          {
            where: {
              user_id: withdrawal.user_id,
              transaction_type: TransactionType.WITHDRAWAL,
              amount: withdrawal.amount
            },
            transaction: dbTransaction
          }
        );
      }

      await dbTransaction.commit();
      return withdrawal;
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  /**
   * Get withdrawal history
   */
  static async getWithdrawalHistory(
    userId: number,
    page: number = 1,
    limit: number = 20
  ) {
    const offset = (page - 1) * limit;

    const { rows, count } = await Withdrawal.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [['created_at', 'DESC']]
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
}
