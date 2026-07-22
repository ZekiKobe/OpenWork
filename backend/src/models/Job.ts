import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum JobStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum JobCategory {
  WEB_DEVELOPMENT = 'web-development',
  MOBILE_DEVELOPMENT = 'mobile-development',
  DESIGN = 'design',
  WRITING = 'writing',
  MARKETING = 'marketing',
  DATA_SCIENCE = 'data-science',
  CONSULTING = 'consulting',
  OTHER = 'other'
}

export enum JobType {
  FIXED = 'fixed',
  HOURLY = 'hourly'
}

export interface JobAttributes {
  id: number;
  client_id: number;
  title: string;
  description: string;
  category: JobCategory;
  subcategory?: string;
  tags: string[];
  job_type: JobType;
  budget_min?: number;
  budget_max?: number;
  fixed_price?: number;
  estimated_hours?: number;
  experience_level: 'entry' | 'intermediate' | 'expert';
  duration: 'short' | 'medium' | 'long';
  deadline?: Date;
  requirements: string[];
  preferred_skills: string[];
  attachments: string[];
  status: JobStatus;
  featured: boolean;
  total_applications: number;
  created_at: Date;
  updated_at: Date;
}

export interface JobCreationAttributes extends Omit<JobAttributes, 'id' | 'created_at' | 'updated_at' | 'total_applications'> {}

class Job extends Model<JobAttributes, JobCreationAttributes> implements JobAttributes {
  public id!: number;
  public client_id!: number;
  public title!: string;
  public description!: string;
  public category!: JobCategory;
  public subcategory?: string;
  public tags!: string[];
  public job_type!: JobType;
  public budget_min?: number;
  public budget_max?: number;
  public fixed_price?: number;
  public estimated_hours?: number;
  public experience_level!: 'entry' | 'intermediate' | 'expert';
  public duration!: 'short' | 'medium' | 'long';
  public deadline?: Date;
  public requirements!: string[];
  public preferred_skills!: string[];
  public attachments!: string[];
  public status!: JobStatus;
  public featured!: boolean;
  public total_applications!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual properties
  public get budgetRange(): string {
    if (this.job_type === JobType.FIXED && this.fixed_price) {
      return `$${this.fixed_price}`;
    }
    if (this.budget_min && this.budget_max) {
      return `$${this.budget_min} - $${this.budget_max}`;
    }
    return 'Budget not specified';
  }

  public get isExpired(): boolean {
    return this.deadline ? new Date() > this.deadline : false;
  }

  public get daysLeft(): number | null {
    if (!this.deadline) return null;
    const diffTime = this.deadline.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [10, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [50, 5000]
      }
    },
    category: {
      type: DataTypes.ENUM(...Object.values(JobCategory)),
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
          if (value.length > 15) {
            throw new Error('Maximum 15 tags allowed');
          }
        }
      }
    },
    job_type: {
      type: DataTypes.ENUM(...Object.values(JobType)),
      allowNull: false,
      defaultValue: JobType.FIXED
    },
    budget_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 5.00
      }
    },
    budget_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 5.00
      }
    },
    fixed_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      validate: {
        min: 5.00
      }
    },
    estimated_hours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 2000
      }
    },
    experience_level: {
      type: DataTypes.ENUM('entry', 'intermediate', 'expert'),
      allowNull: false,
      defaultValue: 'intermediate'
    },
    duration: {
      type: DataTypes.ENUM('short', 'medium', 'long'),
      allowNull: false,
      defaultValue: 'medium'
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    preferred_skills: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM(...Object.values(JobStatus)),
      allowNull: false,
      defaultValue: JobStatus.OPEN
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    total_applications: {
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
    modelName: 'Job',
    tableName: 'jobs',
    timestamps: false
  }
);

export default Job;