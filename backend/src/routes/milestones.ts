import { Router } from 'express';
import { MilestoneController, createMilestoneValidators } from '../controllers/milestoneController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/job/:jobId', authenticate, MilestoneController.listByJob);
router.get('/contract/:contractId', authenticate, MilestoneController.listByContract);
router.post('/', authenticate, createMilestoneValidators, MilestoneController.create);
router.put('/:id/status', authenticate, MilestoneController.updateStatus);
router.delete('/:id', authenticate, MilestoneController.remove);

export default router;
