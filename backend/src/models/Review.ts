import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum ReviewType {
  CONTRACT = 'contract',
  JOB = 'job',
  GIG = 'gig'
}

export interface ReviewAttributes {
  id: number;
  reviewer_id: number; // User who wrote the review
  reviewee_id: number; // User being reviewed
  contract_id?: number;
  job_id?: number;
  gig_id?: number;
  review_type: ReviewType;
  rating: number; // 1-5
  comment: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ReviewCreationAttributes extends Omit<ReviewAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
  public id!: number;
  public reviewer_id!: number;
  public reviewee_id!: number;
  public contract_id?: number;
  public job_id?: number;
  public gig_id?: number;
  public review_type!: ReviewType;
  public rating!: number;
  public comment!: string;
  public is_public!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Review.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reviewer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    reviewee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
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
    gig_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'gigs',
        key: 'id'
      }
    },
    review_type: {
      type: DataTypes.ENUM(...Object.values(ReviewType)),
      allowNull: false
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      validate: {
        min: 1.00,
        max: 5.00
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 1000]
      }
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    modelName: 'Review',
    tableName: 'reviews',
    timestamps: false,
    indexes: [
      { fields: ['reviewer_id'] },
      { fields: ['reviewee_id'] },
      { fields: ['contract_id'] },
      { fields: ['job_id'] },
      { fields: ['gig_id'] },
      { fields: ['review_type'] },
      {
        unique: true,
        fields: ['contract_id', 'reviewer_id'],
        where: {
          review_type: 'contract'
        }
      }
    ]
  }
);

export default Review;
