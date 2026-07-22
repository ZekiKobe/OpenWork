import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';

export enum UserRole {
  USER = 'user',
  FREELANCER = 'freelancer',
  CLIENT = 'client',
  MODERATOR = 'moderator',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

export interface UserAttributes {
  id: number;
  email: string;
  password_hash: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  // Professional Information
  title?: string;
  company?: string;
  location?: string;
  website?: string;
  // Skills and Expertise
  skills?: string[];
  expertise_areas?: string[];
  // Experience
  years_of_experience?: number;
  current_role?: string;
  // Education
  education_level?: string;
  field_of_study?: string;
  // Social Links
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  // Preferences
  is_public_profile: boolean;
  show_email: boolean;
  // System fields
  role: UserRole;
  status: UserStatus;
  total_points: number;
  rating?: number;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'total_points' | 'is_public_profile' | 'show_email'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public password_hash!: string;
  public username!: string;
  public bio?: string;
  public avatar_url?: string;
  public role!: UserRole;
  public status!: UserStatus;
  public total_points!: number;
  public rating?: number;
  public email_verified!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Professional Information
  public title?: string;
  public company?: string;
  public location?: string;
  public website?: string;

  // Skills and Expertise
  public skills?: string[];
  public expertise_areas?: string[];

  // Experience
  public years_of_experience?: number;
  public current_role?: string;

  // Education
  public education_level?: string;
  public field_of_study?: string;

  // Social Links
  public linkedin_url?: string;
  public github_url?: string;
  public twitter_url?: string;

  // Preferences
  public is_public_profile!: boolean;
  public show_email!: boolean;

  // Instance methods
  public async checkPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  public async hashPassword(): Promise<void> {
    if (this.password_hash && !this.password_hash.startsWith('$2a$')) {
      this.password_hash = await bcrypt.hash(this.password_hash, 12);
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        is: /^[a-zA-Z0-9_]+$/
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500]
      }
    },
    avatar_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    // Professional Information
    title: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    company: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    // Skills and Expertise
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    expertise_areas: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    // Experience
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 50
      }
    },
    current_role: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    // Education
    education_level: {
      type: DataTypes.ENUM('high_school', 'associate', 'bachelor', 'master', 'phd', 'other'),
      allowNull: true
    },
    field_of_study: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: [0, 100]
      }
    },
    // Social Links
    linkedin_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    github_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    twitter_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    // Preferences
    is_public_profile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    show_email: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER
    },
    status: {
      type: DataTypes.ENUM(...Object.values(UserStatus)),
      allowNull: false,
      defaultValue: UserStatus.ACTIVE
    },
    total_points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      defaultValue: null,
      validate: {
        min: 0.00,
        max: 5.00
      }
    },
    email_verified: {
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
    modelName: 'User',
    tableName: 'users',
    timestamps: false, // Disable automatic timestamps since we're defining them manually
    hooks: {
      beforeCreate: async (user: User) => {
        await user.hashPassword();
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password_hash')) {
          await user.hashPassword();
        }
      }
    }
  }
);

export default User;
