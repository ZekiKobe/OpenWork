import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface PostAttributes {
  id: number;
  user_id: number;
  title: string;
  content: string;
  tags: string[];
  thumbnail_url?: string;
  category: string;
  expertise_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimated_read_time?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  is_hidden: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface PostCreationAttributes extends Omit<PostAttributes, 'id' | 'created_at' | 'updated_at' | 'is_hidden'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: number;
  public user_id!: number;
  public title!: string;
  public content!: string;
  public tags!: string[];
  public thumbnail_url?: string;
  public category!: string;
  public expertise_level!: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  public estimated_read_time?: number;
  public prerequisites?: string[];
  public learning_objectives?: string[];
  public is_hidden!: boolean;
  public deleted_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association mixins will be added by sequelize
  public readonly author?: User;
  public readonly Likes?: any[];
  public readonly Comments?: any[];
}

Post.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [5, 255]
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 10000]
      }
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
          value.forEach(tag => {
            if (typeof tag !== 'string' || tag.length < 2 || tag.length > 50) {
              throw new Error('Each tag must be a string between 2 and 50 characters');
            }
          });
        }
      }
    },
    thumbnail_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 50]
      }
    },
    expertise_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
      allowNull: false
    },
    estimated_read_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 60
      }
    },
    prerequisites: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    learning_objectives: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    is_hidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    modelName: 'Post',
    tableName: 'posts',
    timestamps: false, // Disable automatic timestamps since we're defining them manually
    paranoid: true // Enable soft deletes
  }
);

export default Post;
