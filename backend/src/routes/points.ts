import { Router } from 'express';
import { PointsController } from '../controllers/pointsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All points routes require authentication
router.use(authenticate);

// GET /points/balance
router.get('/balance', PointsController.getBalance);

// GET /points/stats
router.get('/stats', PointsController.getStats);

export default router;
