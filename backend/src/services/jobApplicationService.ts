import JobApplication, { JobApplicationCreationAttributes, ApplicationStatus } from '../models/JobApplication';
import Job from '../models/Job';
import User from '../models/User';
import { Op } from 'sequelize';

interface CreateApplicationData {
  job_id: number;
  freelancer_id: number;
  cover_letter: string;
  proposed_rate?: number;
  proposed_hours?: number;
  estimated_completion?: Date;
}

interface UpdateApplicationData {
  status?: string;
  notes?: string;
}

export class JobApplicationService {
  static async createApplication(data: CreateApplicationData) {
    const application = await JobApplication.create({
      job_id: data.job_id,
      freelancer_id: data.freelancer_id,
      cover_letter: data.cover_letter,
      proposed_rate: data.proposed_rate,
      proposed_hours: data.proposed_hours,
      estimated_completion: data.estimated_completion,
      attachments: [],
      status: ApplicationStatus.PENDING,
    });

    return this.getApplicationById(application.id);
  }

  static async getApplicationById(id: number) {
    return await JobApplication.findOne({
      where: { id },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'username', 'avatar_url', 'rating']
            }
          ]
        },
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'rating']
        }
      ]
    });
  }

  static async getUserApplications(userId: number) {
    return await JobApplication.findAll({
      where: { freelancer_id: userId },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'username', 'avatar_url', 'rating']
            }
          ]
        },
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'rating']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  static async getJobApplications(jobId: number) {
    return await JobApplication.findAll({
      where: { job_id: jobId },
      include: [
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'rating']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  static async updateApplicationStatus(id: number, status: string, notes?: string) {
    const application = await JobApplication.findByPk(id);
    if (!application) {
      throw new Error('Application not found');
    }

    // Validate status
    const validStatuses = Object.values(ApplicationStatus);
    if (!validStatuses.includes(status as ApplicationStatus)) {
      throw new Error('Invalid status');
    }

    await application.update({
      status: status as ApplicationStatus,
      notes
    });

    return this.getApplicationById(id);
  }

  static async deleteApplication(id: number) {
    const application = await JobApplication.findByPk(id);
    if (!application) {
      throw new Error('Application not found');
    }

    await application.destroy();
    return true;
  }

  static async getApplicationsByStatus(status: string) {
    return await JobApplication.findAll({
      where: { status },
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'username', 'avatar_url', 'rating']
            }
          ]
        },
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'rating']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  static async getFreelancerApplications(freelancerId: number, status?: string) {
    const whereClause: any = { freelancer_id: freelancerId };
    if (status) {
      whereClause.status = status;
    }

    return await JobApplication.findAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          include: [
            {
              model: User,
              as: 'client',
              attributes: ['id', 'username', 'avatar_url', 'rating']
            }
          ]
        },
        {
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'rating']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }
}