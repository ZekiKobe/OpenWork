import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface LikeAttributes {
  id: number;
  post_id: number;
  user_id: number;
  created_at: Date;
  updated_at: Date;
}

export interface LikeCreationAttributes extends Omit<LikeAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id!: number;
  public post_id!: number;
  public user_id!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Association mixins will be added by sequelize
  public readonly User?: any;
  public readonly Post?: any;
}

Like.init(
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
    modelName: 'Like',
    tableName: 'likes',
    timestamps: false, // Disable automatic timestamps since we're defining them manually
    indexes: [
      {
        unique: true,
        fields: ['post_id', 'user_id'],
        name: 'unique_post_user_like'
      }
    ]
  }
);

export default Like;
