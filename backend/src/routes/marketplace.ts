import { Router } from 'express';
import { marketplaceController } from '../controllers/marketplaceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Gig routes
router.post('/gigs', authenticate, marketplaceController.createGig);
router.get('/gigs', marketplaceController.getGigs);
router.get('/gigs/:id', marketplaceController.getGigById);
router.put('/gigs/:id', authenticate, marketplaceController.updateGig);
router.delete('/gigs/:id', authenticate, marketplaceController.deleteGig);

// Message routes
router.post('/messages', authenticate, marketplaceController.sendMessage);
router.get('/messages', authenticate, marketplaceController.getMessages);
router.get('/conversations', authenticate, marketplaceController.getConversations);

// Contract routes
router.post('/contracts', authenticate, marketplaceController.createContract);
router.get('/contracts', authenticate, marketplaceController.getContracts);
router.get('/contracts/my-contracts', authenticate, marketplaceController.getMyContracts);
router.put('/contracts/:id/status', authenticate, marketplaceController.updateContractStatus);

export default router;