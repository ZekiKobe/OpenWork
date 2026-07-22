import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum MilestoneStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface MilestoneAttributes {
  id: number;
  job_id: number;
  contract_id?: number;
  title: string;
  description: string;
  amount: number; // Payment amount for this milestone
  order: number; // Order of milestone in the job
  status: MilestoneStatus;
  due_date?: Date;
  completed_at?: Date;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface MilestoneCreationAttributes extends Omit<MilestoneAttributes, 'id' | 'created_at' | 'updated_at' | 'status'> {}

class Milestone extends Model<MilestoneAttributes, MilestoneCreationAttributes> implements MilestoneAttributes {
  public id!: number;
  public job_id!: number;
  public contract_id?: number;
  public title!: string;
  public description!: string;
  public amount!: number;
  public order!: number;
  public status!: MilestoneStatus;
  public due_date?: Date;
  public completed_at?: Date;
  public approved_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Milestone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'jobs',
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
    title: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.ENUM(...Object.values(MilestoneStatus)),
      allowNull: false,
      defaultValue: MilestoneStatus.PENDING
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approved_at: {
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
    modelName: 'Milestone',
    tableName: 'milestones',
    timestamps: false,
    indexes: [
      { fields: ['job_id'] },
      { fields: ['contract_id'] },
      { fields: ['status'] }
    ]
  }
);

export default Milestone;
