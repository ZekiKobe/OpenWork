import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum ReportTargetType {
  POST = 'post',
  COMMENT = 'comment',
  USER = 'user'
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  HATE_SPEECH = 'hate_speech',
  MISINFORMATION = 'misinformation',
  OTHER = 'other'
}

export interface ReportAttributes {
  id: number;
  reporter_id: number;
  target_type: ReportTargetType;
  target_id: number;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  moderator_id?: number;
  moderator_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ReportCreationAttributes extends Omit<ReportAttributes, 'id' | 'created_at' | 'updated_at' | 'status'> {}

class Report extends Model<ReportAttributes, ReportCreationAttributes> implements ReportAttributes {
  public id!: number;
  public reporter_id!: number;
  public target_type!: ReportTargetType;
  public target_id!: number;
  public reason!: ReportReason;
  public description?: string;
  public status!: ReportStatus;
  public moderator_id?: number;
  public moderator_notes?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association mixins will be added by sequelize
  public readonly reporter?: any;
  public readonly moderator?: any;
}

Report.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    target_type: {
      type: DataTypes.ENUM(...Object.values(ReportTargetType)),
      allowNull: false
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reason: {
      type: DataTypes.ENUM(...Object.values(ReportReason)),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ReportStatus)),
      allowNull: false,
      defaultValue: ReportStatus.PENDING
    },
    moderator_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    moderator_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000]
      }
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
    modelName: 'Report',
    tableName: 'reports',
    timestamps: false // Disable automatic timestamps since we're defining them manually
  }
);

export default Report;
