import { Router } from 'express';
import { 
  createJobApplication, 
  getUserApplications, 
  getJobApplications, 
  updateApplicationStatus, 
  getApplication 
} from '../controllers/jobApplicationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Freelancer routes
router.post('/', createJobApplication); // Apply for a job
router.get('/my-applications', getUserApplications); // Get user's applications

// Client routes
router.get('/job/:jobId', getJobApplications); // Get applications for a specific job
router.put('/:id/status', updateApplicationStatus); // Update application status

// General routes
router.get('/:id', getApplication); // Get specific application

export default router;