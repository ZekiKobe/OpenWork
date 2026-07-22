import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface WalletAttributes {
  id: number;
  user_id: number;
  balance: number;
  pending_balance: number; // Money in escrow
  total_earned: number;
  total_withdrawn: number;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface WalletCreationAttributes extends Omit<WalletAttributes, 'id' | 'created_at' | 'updated_at' | 'balance' | 'pending_balance' | 'total_earned' | 'total_withdrawn'> {}

class Wallet extends Model<WalletAttributes, WalletCreationAttributes> implements WalletAttributes {
  public id!: number;
  public user_id!: number;
  public balance!: number;
  public pending_balance!: number;
  public total_earned!: number;
  public total_withdrawn!: number;
  public currency!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public get availableBalance(): number {
    return this.balance;
  }

  public get totalBalance(): number {
    return this.balance + this.pending_balance;
  }
}

Wallet.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00
      }
    },
    pending_balance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00
      }
    },
    total_earned: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00
      }
    },
    total_withdrawn: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'USD'
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
    modelName: 'Wallet',
    tableName: 'wallets',
    timestamps: false
  }
);

export default Wallet;
