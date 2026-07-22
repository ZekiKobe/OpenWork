import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface CommentAttributes {
  id: number;
  post_id: number;
  user_id: number;
  parent_id?: number;
  content: string;
  is_hidden: boolean;
  deleted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CommentCreationAttributes extends Omit<CommentAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public parent_id?: number;
  public content!: string;
  public is_hidden!: boolean;
  public deleted_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association mixins will be added by sequelize
  public readonly author?: User;
  public readonly Post?: any;
  public readonly Parent?: any;
  public readonly Replies?: any[];
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 1000]
      }
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
    modelName: 'Comment',
    tableName: 'comments',
    timestamps: false, // Disable automatic timestamps since we're defining them manually
    paranoid: true // Enable soft deletes
  }
);

export default Comment;
