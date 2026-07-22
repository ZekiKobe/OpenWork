import Stripe from 'stripe';
import { PaymentService } from './paymentService';
import Transaction, { TransactionType, TransactionStatus } from '../models/Transaction';
import Wallet from '../models/Wallet';

export function isPaymentsEnabled(): boolean {
  return (
    process.env.PAYMENTS_ENABLED === 'true' &&
    Boolean(process.env.STRIPE_SECRET_KEY)
  );
}

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export class StripePaymentService {
  /**
   * Create a Stripe Checkout session to deposit funds into the user wallet.
   */
  static async createDepositSession(
    userId: number,
    amount: number,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; url: string | null }> {
    if (!isPaymentsEnabled()) {
      throw new Error('Payments are disabled. Set PAYMENTS_ENABLED=true and STRIPE_SECRET_KEY.');
    }

    if (amount < 5) {
      throw new Error('Minimum deposit is $5.00');
    }

    const stripe = getStripe();
    const amountCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'OpenWork wallet deposit',
              description: `Deposit $${amount.toFixed(2)} to wallet`
            }
          }
        }
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: String(userId),
        amount: String(amount),
        type: 'wallet_deposit'
      }
    });

    return { sessionId: session.id, url: session.url };
  }

  /**
   * Credit wallet after successful Stripe checkout (webhook).
   */
  static async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.metadata?.type !== 'wallet_deposit') {
      return;
    }

    const userId = parseInt(session.metadata.userId || '', 10);
    const amount = parseFloat(session.metadata.amount || '0');
    const reference = session.id;

    if (!userId || !amount || !reference) {
      throw new Error('Invalid deposit session metadata');
    }

    // Idempotency: skip if already processed
    const existing = await Transaction.findOne({
      where: { reference, transaction_type: TransactionType.DEPOSIT }
    });
    if (existing) {
      return;
    }

    const wallet = await PaymentService.getOrCreateWallet(userId);
    const dbTransaction = await Wallet.sequelize!.transaction();

    try {
      await wallet.update(
        {
          balance: parseFloat(wallet.balance.toString()) + amount
        },
        { transaction: dbTransaction }
      );

      await Transaction.create(
        {
          user_id: userId,
          wallet_id: wallet.id,
          transaction_type: TransactionType.DEPOSIT,
          amount,
          fee: 0,
          net_amount: amount,
          status: TransactionStatus.COMPLETED,
          description: 'Wallet deposit via Stripe',
          reference,
          metadata: { stripe_session_id: session.id }
        } as any,
        { transaction: dbTransaction }
      );

      await dbTransaction.commit();
    } catch (error) {
      await dbTransaction.rollback();
      throw error;
    }
  }

  static constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    const stripe = getStripe();
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
