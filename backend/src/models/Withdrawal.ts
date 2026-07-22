import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum WithdrawalMethod {
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
  CRYPTO = 'crypto'
}

export interface WithdrawalAttributes {
  id: number;
  user_id: number;
  wallet_id: number;
  amount: number;
  fee: number;
  net_amount: number;
  method: WithdrawalMethod;
  status: WithdrawalStatus;
  account_details: Record<string, any>; // Encrypted payment details
  rejection_reason?: string;
  processed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface WithdrawalCreationAttributes extends Omit<WithdrawalAttributes, 'id' | 'created_at' | 'updated_at' | 'fee' | 'net_amount' | 'status'> {}

class Withdrawal extends Model<WithdrawalAttributes, WithdrawalCreationAttributes> implements WithdrawalAttributes {
  public id!: number;
  public user_id!: number;
  public wallet_id!: number;
  public amount!: number;
  public fee!: number;
  public net_amount!: number;
  public method!: WithdrawalMethod;
  public status!: WithdrawalStatus;
  public account_details!: Record<string, any>;
  public rejection_reason?: string;
  public processed_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Withdrawal.init(
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 10.00 // Minimum withdrawal amount
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
    method: {
      type: DataTypes.ENUM(...Object.values(WithdrawalMethod)),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(...Object.values(WithdrawalStatus)),
      allowNull: false,
      defaultValue: WithdrawalStatus.PENDING
    },
    account_details: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    processed_at: {
      type: DataTypes.DATE,
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
    modelName: 'Withdrawal',
    tableName: 'withdrawals',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['wallet_id'] },
      { fields: ['status'] },
      { fields: ['created_at'] }
    ]
  }
);

export default Withdrawal;
