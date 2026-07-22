import { Request, Response } from 'express';
import JobApplication, { ApplicationStatus } from '../models/JobApplication';
import Job from '../models/Job';
import User from '../models/User';
import { JobApplicationService } from '../services/jobApplicationService';

// Extend the Request interface to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export const createJobApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const { job_id, cover_letter, proposed_rate, proposed_hours, estimated_completion } = req.body;

    // Check if user is a freelancer
    const user = await User.findByPk(userId);
    if (!user || user.role !== 'freelancer') {
      return res.status(403).json({ success: false, error: 'Only freelancers can apply for jobs' });
    }

    const application = await JobApplicationService.createApplication({
      job_id,
      freelancer_id: userId,
      cover_letter,
      proposed_rate,
      proposed_hours,
      estimated_completion
    });

    res.status(201).json({
      success: true,
      application,
      message: 'Job application submitted successfully'
    });
  } catch (error: any) {
    console.error('Error creating job application:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to create job application' });
  }
};

export const getUserApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const applications = await JobApplicationService.getUserApplications(userId);

    res.status(200).json({
      success: true,
      applications
    });
  } catch (error: any) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch user applications' });
  }
};

export const getJobApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    // Only allow clients and admins to view job applications
    const user = await User.findByPk(userId);
    if (!user || (user.role !== 'client' && user.role !== 'admin' && user.role !== 'moderator')) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const jobId = parseInt(req.params.jobId, 10);
    if (isNaN(jobId)) {
      return res.status(400).json({ success: false, error: 'Invalid job ID' });
    }
    const applications = await JobApplicationService.getJobApplications(jobId);

    res.status(200).json({
      success: true,
      applications
    });
  } catch (error: any) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch job applications' });
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({ success: false, error: 'Invalid application ID' });
    }
    const { status, notes } = req.body;

    // Check if user is client or admin/moderator
    const user = await User.findByPk(userId);
    if (!user || (user.role !== 'client' && user.role !== 'admin' && user.role !== 'moderator')) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const updatedApplication = await JobApplicationService.updateApplicationStatus(
      applicationId,
      status,
      notes
    );

    res.status(200).json({
      success: true,
      application: updatedApplication,
      message: 'Application status updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to update application status' });
  }
};

export const getApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' });
    }

    const applicationId = parseInt(req.params.id, 10);
    if (isNaN(applicationId)) {
      return res.status(400).json({ success: false, error: 'Invalid application ID' });
    }
    const application = await JobApplicationService.getApplicationById(applicationId);

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    // Allow access if user is the applicant, job poster, or admin/moderator
    if (application.freelancer_id !== userId) {
      const job = await Job.findByPk(application.job_id);
      if (!job || (job.client_id !== userId && !['admin', 'moderator'].includes(req.user?.role || ''))) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error: any) {
    console.error('Error fetching application:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch application' });
  }
};