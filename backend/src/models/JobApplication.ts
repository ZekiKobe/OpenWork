import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum ApplicationStatus {
  PENDING = 'pending',
  SHORTLISTED = 'shortlisted',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export interface JobApplicationAttributes {
  id: number;
  job_id: number;
  freelancer_id: number;
  cover_letter: string;
  proposed_rate?: number;
  proposed_hours?: number;
  estimated_completion?: Date;
  attachments: string[];
  status: ApplicationStatus;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JobApplicationCreationAttributes extends Omit<JobApplicationAttributes, 'id' | 'created_at' | 'updated_at'> {}

class JobApplication extends Model<JobApplicationAttributes, JobApplicationCreationAttributes> implements JobApplicationAttributes {
  public id!: number;
  public job_id!: number;
  public freelancer_id!: number;
  public cover_letter!: string;
  public proposed_rate?: number;
  public proposed_hours?: number;
  public estimated_completion?: Date;
  public attachments!: string[];
  public status!: ApplicationStatus;
  public notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

JobApplication.init(
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
    freelancer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000]
      }
    },
    proposed_rate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 1.00
      }
    },
    proposed_hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 2000
      }
    },
    estimated_completion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ApplicationStatus)),
      allowNull: false,
      defaultValue: ApplicationStatus.PENDING
    },
    notes: {
      type: DataTypes.TEXT,
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
    modelName: 'JobApplication',
    tableName: 'job_applications',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['job_id', 'freelancer_id']
      },
      {
        fields: ['freelancer_id']
      },
      {
        fields: ['status']
      }
    ]
  }
);

export default JobApplication;