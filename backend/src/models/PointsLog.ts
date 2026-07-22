import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum PointsSource {
  POST_CREATION = 'post_creation',
  POST_LIKE = 'post_like',
  COMMENT_CREATION = 'comment_creation',
  POST_HELPFUL = 'post_helpful',
  MODERATOR_BONUS = 'moderator_bonus',
  REPORT_CONFIRMED = 'report_confirmed'
}

export interface PointsLogAttributes {
  id: number;
  user_id: number;
  source: PointsSource;
  points: number;
  reference_id?: number; // ID of the related post/comment/like
  description?: string;
  created_at: Date;
}

export interface PointsLogCreationAttributes extends Omit<PointsLogAttributes, 'id' | 'created_at'> {}

class PointsLog extends Model<PointsLogAttributes, PointsLogCreationAttributes> implements PointsLogAttributes {
  public id!: number;
  public user_id!: number;
  public source!: PointsSource;
  public points!: number;
  public reference_id?: number;
  public description?: string;
  public readonly created_at!: Date;

  // Association mixins will be added by sequelize
  public readonly User?: any;
}

PointsLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    source: {
      type: DataTypes.ENUM(...Object.values(PointsSource)),
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notZero(value: number) {
          if (value === 0) {
            throw new Error('Points cannot be zero');
          }
        }
      }
    },
    reference_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'PointsLog',
    tableName: 'points_log',
    timestamps: false // Disable automatic timestamps since we're defining them manually
  }
);

export default PointsLog;
