import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum GigStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  DELETED = 'deleted'
}

export enum GigCategory {
  WEB_DEVELOPMENT = 'web-development',
  MOBILE_DEVELOPMENT = 'mobile-development',
  DESIGN = 'design',
  WRITING = 'writing',
  MARKETING = 'marketing',
  DATA_SCIENCE = 'data-science',
  CONSULTING = 'consulting',
  OTHER = 'other'
}

export interface GigAttributes {
  id: number;
  freelancer_id: number;
  title: string;
  description: string;
  category: GigCategory;
  subcategory?: string;
  tags: string[];
  pricing_type: 'fixed' | 'hourly';
  price: number;
  delivery_time: number; // in days
  revisions: number; // number of revisions included
  requirements?: string[]; // what client needs to provide
  features: string[]; // what's included in the service
  images: string[]; // gig images/attachments
  status: GigStatus;
  rating: number;
  total_reviews: number;
  total_orders: number;
  created_at: Date;
  updated_at: Date;
}

export interface GigCreationAttributes extends Omit<GigAttributes, 'id' | 'created_at' | 'updated_at' | 'rating' | 'total_reviews' | 'total_orders'> {}

class Gig extends Model<GigAttributes, GigCreationAttributes> implements GigAttributes {
  public id!: number;
  public freelancer_id!: number;
  public title!: string;
  public description!: string;
  public category!: GigCategory;
  public subcategory?: string;
  public tags!: string[];
  public pricing_type!: 'fixed' | 'hourly';
  public price!: number;
  public delivery_time!: number;
  public revisions!: number;
  public requirements?: string[];
  public features!: string[];
  public images!: string[];
  public status!: GigStatus;
  public rating!: number;
  public total_reviews!: number;
  public total_orders!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual properties
  public get averageRating(): number {
    return this.rating || 0;
  }

  public get totalEarnings(): number {
    return this.total_orders * this.price;
  }
}

Gig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    freelancer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [10, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 2000]
      }
    },
    category: {
      type: DataTypes.ENUM(...Object.values(GigCategory)),
      allowNull: false
    },
    subcategory: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidTags(value: string[]) {
          if (!Array.isArray(value)) {
            throw new Error('Tags must be an array');
          }
          if (value.length > 10) {
            throw new Error('Maximum 10 tags allowed');
          }
          if (value.some(tag => typeof tag !== 'string' || tag.length > 30)) {
            throw new Error('Each tag must be a string with max 30 characters');
          }
        }
      }
    },
    pricing_type: {
      type: DataTypes.ENUM('fixed', 'hourly'),
      allowNull: false,
      defaultValue: 'fixed'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 5.00,
        max: 10000.00
      }
    },
    delivery_time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 365
      }
    },
    revisions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
        max: 10
      }
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidFeatures(value: string[]) {
          if (!Array.isArray(value)) {
            throw new Error('Features must be an array');
          }
          if (value.length > 20) {
            throw new Error('Maximum 20 features allowed');
          }
        }
      }
    },
    images: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM(...Object.values(GigStatus)),
      allowNull: false,
      defaultValue: GigStatus.ACTIVE
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0.00,
        max: 5.00
      }
    },
    total_reviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total_orders: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
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
    modelName: 'Gig',
    tableName: 'gigs',
    timestamps: false
  }
);

export default Gig;