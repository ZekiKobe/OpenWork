import express from 'express';
import { createJob, getJobs, getJob, updateJob, deleteJob, getMyPostedJobs, hireFreelancer } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

console.log('Setting up job routes...');
router.post('/', authenticate, createJob);
router.get('/', (req, res, next) => {
  console.log('GET /api/jobs called');
  getJobs(req, res).catch(next);
});

// User-specific job routes
router.get('/my-posted', authenticate, getMyPostedJobs);

// Hire freelancer
router.post('/:jobId/hire', authenticate, hireFreelancer);

// Specific job routes (must come after specific routes)
router.get('/:id', getJob);
router.put('/:id', authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);

export default router;