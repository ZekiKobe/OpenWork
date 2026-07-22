import express from 'express';
import { PortfolioController } from '../controllers/portfolioController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Get all portfolios for the authenticated user
router.get('/my-portfolios', authenticate, PortfolioController.getUserPortfolios);

// Get all portfolios (with optional user filter) - public endpoint
router.get('/', PortfolioController.getPortfolios);

// Get a specific portfolio by ID
router.get('/:id', PortfolioController.getPortfolio);

// Create a new portfolio - requires authentication
router.post('/', authenticate, PortfolioController.createPortfolio);

// Update a portfolio - requires authentication and ownership
router.put('/:id', authenticate, PortfolioController.updatePortfolio);

// Delete a portfolio - requires authentication and ownership
router.delete('/:id', authenticate, PortfolioController.deletePortfolio);

export default router;