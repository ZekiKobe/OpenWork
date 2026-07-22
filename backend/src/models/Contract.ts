import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export enum ContractStatus {
  PENDING = 'pending', // Client proposed, waiting for freelancer response
  ACCEPTED = 'accepted', // Freelancer accepted, work in progress
  IN_PROGRESS = 'in_progress', // Work actively being done
  COMPLETED = 'completed', // Work finished
  DELIVERED = 'delivered', // Work submitted to client
  APPROVED = 'approved', // Client approved the work
  REVISION_REQUESTED = 'revision_requested', // Client requested changes
  CANCELLED = 'cancelled', // Contract cancelled
  DISPUTED = 'disputed' // Dispute raised
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  RELEASED = 'released',
  REFUNDED = 'refunded'
}

export interface ContractAttributes {
  id: number;
  gig_id: number;
  client_id: number;
  freelancer_id: number;
  title: string;
  description: string;
  price: number;
  delivery_time: number; // in days
  revisions_included: number;
  contract_status: ContractStatus;
  payment_status: PaymentStatus;
  started_at?: Date;
  deadline?: Date;
  completed_at?: Date;
  delivered_at?: Date;
  approved_at?: Date;
  cancelled_at?: Date;
  cancellation_reason?: string;
  client_rating?: number;
  freelancer_rating?: number;
  client_review?: string;
  freelancer_review?: string;
  attachments: string[]; // URLs to contract files
  requirements: string[]; // Client requirements
  deliverables: string[]; // What freelancer will deliver
  created_at: Date;
  updated_at: Date;
}

export interface ContractCreationAttributes extends Omit<ContractAttributes, 'id' | 'created_at' | 'updated_at' | 'contract_status' | 'payment_status'> {}

class Contract extends Model<ContractAttributes, ContractCreationAttributes> implements ContractAttributes {
  public id!: number;
  public gig_id!: number;
  public client_id!: number;
  public freelancer_id!: number;
  public title!: string;
  public description!: string;
  public price!: number;
  public delivery_time!: number;
  public revisions_included!: number;
  public contract_status!: ContractStatus;
  public payment_status!: PaymentStatus;
  public started_at?: Date;
  public deadline?: Date;
  public completed_at?: Date;
  public delivered_at?: Date;
  public approved_at?: Date;
  public cancelled_at?: Date;
  public cancellation_reason?: string;
  public client_rating?: number;
  public freelancer_rating?: number;
  public client_review?: string;
  public freelancer_review?: string;
  public attachments!: string[];
  public requirements!: string[];
  public deliverables!: string[];
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Virtual properties
  public get isActive(): boolean {
    return [ContractStatus.ACCEPTED, ContractStatus.IN_PROGRESS, ContractStatus.DELIVERED, ContractStatus.REVISION_REQUESTED].includes(this.contract_status);
  }

  public get isCompleted(): boolean {
    return [ContractStatus.COMPLETED, ContractStatus.APPROVED].includes(this.contract_status);
  }

  public get daysRemaining(): number | null {
    if (!this.deadline) return null;
    const now = new Date();
    const diffTime = this.deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

Contract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    gig_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gigs',
        key: 'id'
      }
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [5, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000]
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 5.00
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
    revisions_included: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 0,
        max: 10
      }
    },
    contract_status: {
      type: DataTypes.ENUM(...Object.values(ContractStatus)),
      allowNull: false,
      defaultValue: ContractStatus.PENDING
    },
    payment_status: {
      type: DataTypes.ENUM(...Object.values(PaymentStatus)),
      allowNull: false,
      defaultValue: PaymentStatus.UNPAID
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    delivered_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    client_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 1.00,
        max: 5.00
      }
    },
    freelancer_rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 1.00,
        max: 5.00
      }
    },
    client_review: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [10, 500]
      }
    },
    freelancer_review: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [10, 500]
      }
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    deliverables: {
      type: DataTypes.JSON,
      allowNull: false,
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
    modelName: 'Contract',
    tableName: 'contracts',
    timestamps: false
  }
);

export default Contract;