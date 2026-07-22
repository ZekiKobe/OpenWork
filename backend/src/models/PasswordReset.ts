import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface PasswordResetAttributes {
  id: number;
  user_id: number;
  email: string;
  token: string;
  expires_at: Date;
  used_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PasswordResetCreationAttributes extends Omit<PasswordResetAttributes, 'id' | 'created_at' | 'updated_at'> {}

class PasswordReset extends Model<PasswordResetAttributes, PasswordResetCreationAttributes> implements PasswordResetAttributes {
  public id!: number;
  public user_id!: number;
  public email!: string;
  public token!: string;
  public expires_at!: Date;
  public used_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public get isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  public get isValid(): boolean {
    return !this.isExpired && !this.used_at;
  }
}

PasswordReset.init(
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
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used_at: {
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
    modelName: 'PasswordReset',
    tableName: 'password_resets',
    timestamps: false,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['token'] },
      { fields: ['email'] }
    ]
  }
);

export default PasswordReset;
