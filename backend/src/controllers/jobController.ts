import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Job, { JobStatus } from '../models/Job';
import JobApplication, { ApplicationStatus } from '../models/JobApplication';
import User from '../models/User';
import Contract, { ContractStatus, PaymentStatus } from '../models/Contract';
import { AuthenticatedRequest } from '../middleware/auth';
import { PaymentService } from '../services/paymentService';
import { NotificationService } from '../services/notificationService';
import { sequelize } from '../config/database';
import { NotificationType } from '../models/Notification';

export const createJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      title, 
      description, 
      category, 
      subcategory, 
      tags, 
      job_type, 
      budget_min, 
      budget_max, 
      fixed_price, 
      estimated_hours, 
      experience_level, 
      duration, 
      deadline, 
      requirements, 
      preferred_skills 
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    // Check if user is a client
    if (req.user?.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can create jobs' });
    }

    // Validate budget based on job type
    if (job_type === 'hourly') {
      if (!budget_min || !budget_max) {
        return res.status(400).json({ error: 'Budget range is required for hourly jobs' });
      }
      if (budget_min > budget_max) {
        return res.status(400).json({ error: 'Minimum budget cannot be greater than maximum budget' });
      }
    } else if (job_type === 'fixed') {
      if (!fixed_price) {
        return res.status(400).json({ error: 'Fixed price is required for fixed jobs' });
      }
    }

    const job = await Job.create({
      client_id: req.user.id,
      title,
      description,
      category,
      subcategory,
      tags: tags || [],
      job_type,
      budget_min,
      budget_max,
      fixed_price,
      estimated_hours,
      experience_level,
      duration,
      deadline: deadline ? new Date(deadline) : undefined,
      requirements: requirements || [],
      preferred_skills: preferred_skills || [],
      status: JobStatus.OPEN,
      attachments: [],
      featured: false
    });

    res.status(201).json({ job });
  } catch (error: any) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: error.message || 'Failed to create job' });
  }
};

export const getJobs = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      experience_level,
      job_type,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = { status: JobStatus.OPEN }; // Only show open jobs

    if (category) where.category = category;
    if (experience_level) where.experience_level = experience_level;
    if (job_type) where.job_type = job_type;
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }

    // Op is imported at the top
    const jobs = await Job.findAll({
      where,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, sortOrder as string]],
      include: [{
        model: User,
        as: 'client',
        attributes: ['id', 'username', 'avatar_url', 'total_points', 'rating']
      }]
    });

    const total = await Job.count({ where });
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      jobs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch jobs' });
  }
};

export const getJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findByPk(id, {
      include: [{
        model: User,
        as: 'client',
        attributes: ['id', 'username', 'avatar_url', 'total_points', 'rating']
      }]
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ job });
  } catch (error: any) {
    console.error('Error fetching job:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch job' });
  }
};

export const updateJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if the user is the job creator
    if (job.client_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to update this job' });
    }

    // Prevent updating if job is not in 'open' status
    if (job.status !== JobStatus.OPEN) {
      return res.status(400).json({ error: 'Cannot update job that is not open' });
    }

    await job.update(updates);

    res.json({ job });
  } catch (error: any) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: error.message || 'Failed to update job' });
  }
};

export const deleteJob = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if the user is the job creator
    if (job.client_id !== req.user?.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this job' });
    }

    // Prevent deleting if job has applications
    if (job.total_applications > 0) {
      return res.status(400).json({ error: 'Cannot delete job with applications' });
    }

    await job.destroy();

    res.json({ message: 'Job deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: error.message || 'Failed to delete job' });
  }
};

export const getMyPostedJobs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const where: any = { client_id: req.user?.id };

    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const jobs = await Job.findAll({
      where,
      limit: Number(limit),
      offset,
      order: [[sortBy as string, sortOrder as string]],
      include: [{
        model: User,
        as: 'client',
        attributes: ['id', 'username', 'avatar_url', 'total_points', 'rating']
      }]
    });

    const total = await Job.count({ where });
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      jobs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching user jobs:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch jobs' });
  }
};

export const hireFreelancer = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { jobId } = req.params;
    const { application_id, create_escrow = true } = req.body;

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.client_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to hire for this job' });
    }

    if (job.status !== JobStatus.OPEN) {
      return res.status(400).json({ error: 'Job is not open for hiring' });
    }

    const application = await JobApplication.findByPk(application_id, {
      include: [{ model: User, as: 'freelancer' }]
    });

    if (!application || application.job_id !== parseInt(jobId, 10)) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.status !== ApplicationStatus.PENDING && application.status !== ApplicationStatus.SHORTLISTED) {
      return res.status(400).json({ error: 'Application is not in a valid state for hiring' });
    }

    const price = application.proposed_rate
      ? parseFloat(application.proposed_rate.toString())
      : (job.fixed_price ? parseFloat(job.fixed_price.toString()) : parseFloat((job.budget_max || job.budget_min || 0).toString()));

    if (!price || price < 5) {
      return res.status(400).json({ error: 'A valid contract price of at least $5 is required to hire' });
    }

    const deliveryDays = job.deadline
      ? Math.max(1, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 14;

    const dbTx = await sequelize.transaction();
    let contract: Contract;

    try {
      await application.update({ status: ApplicationStatus.ACCEPTED }, { transaction: dbTx });
      await job.update({ status: JobStatus.IN_PROGRESS }, { transaction: dbTx });

      // Reject other pending applications
      await JobApplication.update(
        { status: ApplicationStatus.REJECTED },
        {
          where: {
            job_id: job.id,
            id: { [Op.ne]: application.id },
            status: { [Op.in]: [ApplicationStatus.PENDING, ApplicationStatus.SHORTLISTED] }
          },
          transaction: dbTx
        }
      );

      contract = await Contract.create(
        {
          gig_id: null,
          job_id: job.id,
          client_id: job.client_id,
          freelancer_id: application.freelancer_id,
          title: job.title,
          description: job.description.slice(0, 2000),
          price,
          delivery_time: deliveryDays,
          revisions_included: 1,
          started_at: new Date(),
          deadline: job.deadline || new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000),
          attachments: [],
          requirements: Array.isArray(job.requirements) ? job.requirements : [],
          deliverables: [],
          contract_status: ContractStatus.IN_PROGRESS,
          payment_status: PaymentStatus.UNPAID
        } as any,
        { transaction: dbTx }
      );

      await dbTx.commit();
    } catch (err) {
      await dbTx.rollback();
      throw err;
    }

    let escrowTransaction = null;
    let escrowError: string | undefined;

    if (create_escrow) {
      try {
        escrowTransaction = await PaymentService.createEscrowPayment(job.client_id, contract.id, price);
      } catch (err: any) {
        escrowError = err.message || 'Escrow payment failed — fund wallet and pay escrow from contracts';
      }
    }

    try {
      await NotificationService.createNotification(
        application.freelancer_id,
        NotificationType.JOB_ACCEPTED,
        'You were hired!',
        `You were hired for "${job.title}".`,
        '/my-contracts'
      );
    } catch {
      // Non-blocking
    }

    res.json({
      success: true,
      message: escrowTransaction
        ? 'Freelancer hired and escrow funded'
        : 'Freelancer hired; escrow pending',
      application,
      job,
      contract,
      escrow: escrowTransaction,
      escrowError
    });
  } catch (error: any) {
    console.error('Error hiring freelancer:', error);
    res.status(500).json({ error: error.message || 'Failed to hire freelancer' });
  }
};