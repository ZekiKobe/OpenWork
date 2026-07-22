import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund',
  ESCROW_HOLD = 'escrow_hold',
  ESCROW_RELEASE = 'escrow_release',
  COMMISSION = 'commission',
  TRANSFER = 'transfer'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export interface TransactionAttributes {
  id: number;
  user_id: number;
  wallet_id: number;
  contract_id?: number;
  job_id?: number;
  transaction_type: TransactionType;
  amount: number;
  fee: number; // Platform commission
  net_amount: number; // Amount after fees
  status: TransactionStatus;
  description: string;
  reference?: string; // External payment reference
  metadata?: Record<string, any>; // Additional transaction data
  created_at: Date;
  updated_at: Date;
}

export interface TransactionCreationAttributes extends Omit<TransactionAttributes, 'id' | 'created_at' | 'updated_at' | 'fee' | 'net_amount'> {}

class Transaction extends Model<TransactionAttributes, TransactionCreationAttributes> implements TransactionAttributes {
  public id!: number;
  public user_id!: number;
  public wallet_id!: number;
  public contract_id?: number;
  public job_id?: number;
  public transaction_type!: TransactionType;
  public amount!: number;
  public fee!: number;
  public net_amount!: number;
  public status!: TransactionStatus;
  public description!: string;
  public reference?: string;
  public metadata?: Record<string, any>;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Transaction.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    wallet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'wallets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    contract_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'contracts',
        key: 'id'
      }
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'jobs',
        key: 'id'
      }
    },
    transaction_type: {
      type: DataTypes.ENUM(...Object.values(TransactionType)),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    fee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00
      }
    },
    net_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.00
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(TransactionStatus)),
      allowNull: false,
      defaultValue: TransactionStatus.PENDING
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reference: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['wallet_id'] },
      { fields: ['contract_id'] },
      { fields: ['status'] },
      { fields: ['transaction_type'] },
      { fields: ['created_at'] }
    ]
  }
);

export default Transaction;
