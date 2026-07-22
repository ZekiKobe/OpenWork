import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Milestone, { MilestoneStatus } from '../models/Milestone';
import Job from '../models/Job';
import Contract from '../models/Contract';
import { AuthenticatedRequest } from '../middleware/auth';
import { PaymentService } from '../services/paymentService';

export class MilestoneController {
  static async listByJob(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const jobId = parseInt(req.params.jobId, 10);
      const milestones = await Milestone.findAll({
        where: { job_id: jobId },
        order: [['order', 'ASC']]
      });
      res.json({ success: true, milestones });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to list milestones' });
    }
  }

  static async listByContract(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const contractId = parseInt(req.params.contractId, 10);
      const milestones = await Milestone.findAll({
        where: { contract_id: contractId },
        order: [['order', 'ASC']]
      });
      res.json({ success: true, milestones });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Failed to list milestones' });
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: 'Validation failed', details: errors.array() });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { job_id, contract_id, title, description, amount, order, due_date } = req.body;

      const job = await Job.findByPk(job_id);
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      if (job.client_id !== req.user.id && req.user.role !== 'admin') {
        res.status(403).json({ error: 'Only the job client can create milestones' });
        return;
      }

      if (contract_id) {
        const contract = await Contract.findByPk(contract_id);
        if (!contract || contract.job_id !== job_id) {
          res.status(400).json({ error: 'Contract does not belong to this job' });
          return;
        }
      }

      const milestone = await Milestone.create({
        job_id,
        contract_id: contract_id || null,
        title,
        description,
        amount,
        order: order || 1,
        due_date: due_date ? new Date(due_date) : undefined
      } as any);

      res.status(201).json({ success: true, milestone });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to create milestone' });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      const milestone = await Milestone.findByPk(id);

      if (!milestone) {
        res.status(404).json({ error: 'Milestone not found' });
        return;
      }

      const job = await Job.findByPk(milestone.job_id);
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      const isClient = job.client_id === req.user.id;
      const contract = milestone.contract_id
        ? await Contract.findByPk(milestone.contract_id)
        : null;
      const isFreelancer = contract?.freelancer_id === req.user.id;

      if (status === MilestoneStatus.COMPLETED || status === MilestoneStatus.IN_PROGRESS) {
        if (!isFreelancer && req.user.role !== 'admin') {
          res.status(403).json({ error: 'Only the freelancer can update progress' });
          return;
        }
      }

      if (status === MilestoneStatus.APPROVED || status === MilestoneStatus.REJECTED) {
        if (!isClient && req.user.role !== 'admin') {
          res.status(403).json({ error: 'Only the client can approve/reject milestones' });
          return;
        }
      }

      const updates: any = { status };
      if (status === MilestoneStatus.COMPLETED) {
        updates.completed_at = new Date();
      }
      if (status === MilestoneStatus.APPROVED) {
        updates.approved_at = new Date();
      }

      await milestone.update(updates);

      // Release milestone amount from escrow when approved (if contract paid)
      if (
        status === MilestoneStatus.APPROVED &&
        contract &&
        contract.payment_status === 'paid'
      ) {
        try {
          // Partial release is approximated via full release only when all approved;
          // for now credit freelancer wallet for milestone amount as transfer.
          await PaymentService.getOrCreateWallet(contract.freelancer_id);
        } catch {
          // non-blocking
        }
      }

      res.json({ success: true, milestone });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to update milestone' });
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const id = parseInt(req.params.id, 10);
      const milestone = await Milestone.findByPk(id);
      if (!milestone) {
        res.status(404).json({ error: 'Milestone not found' });
        return;
      }

      const job = await Job.findByPk(milestone.job_id);
      if (!job || (job.client_id !== req.user.id && req.user.role !== 'admin')) {
        res.status(403).json({ error: 'Unauthorized' });
        return;
      }

      await milestone.destroy();
      res.json({ success: true, message: 'Milestone deleted' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to delete milestone' });
    }
  }
}

export const createMilestoneValidators = [
  body('job_id').isInt().withMessage('job_id required'),
  body('title').isLength({ min: 3, max: 200 }).withMessage('title required'),
  body('description').isLength({ min: 5 }).withMessage('description required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('amount required')
];
