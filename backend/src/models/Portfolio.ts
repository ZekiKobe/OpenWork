import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import User from './User';

export interface PortfolioAttributes {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  category?: string;
  technologies?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface PortfolioCreationAttributes extends Omit<PortfolioAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Portfolio extends Model<PortfolioAttributes, PortfolioCreationAttributes> implements PortfolioAttributes {
  public id!: number;
  public user_id!: number;
  public title!: string;
  public description!: string;
  public image_url?: string;
  public link_url?: string;
  public category?: string;
  public technologies?: string[];
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Portfolio.init(
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
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 2000]
      }
    },
    image_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    link_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    technologies: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
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
    modelName: 'Portfolio',
    tableName: 'portfolios',
    timestamps: false // Using manual timestamps
  }
);



export default Portfolio;