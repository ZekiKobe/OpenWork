import { Request, Response } from 'express';
import { User as UserModel } from '../models';

// Extend the Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: UserModel;
}
import { PortfolioService } from '../services/portfolioService';
import { PortfolioCreationAttributes } from '../models/Portfolio';

export class PortfolioController {
  /**
   * Get all portfolios for the authenticated user
   */
  static async getUserPortfolios(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const portfolios = await PortfolioService.getUserPortfolios(userId);
      
      // Remap portfolioUser to user to match frontend expectations and remove circular references
      const mappedPortfolios = portfolios.map(portfolio => {
        // Convert to plain object to remove circular references
        const plainPortfolio = JSON.parse(JSON.stringify(portfolio));
        
        // Destructure to separate portfolioUser
        const { portfolioUser, ...rest } = plainPortfolio;
        return {
          ...rest,
          user: portfolioUser
        };
      });
      
      res.status(200).json({
        success: true,
        portfolios: mappedPortfolios
      });
    } catch (error: any) {
      console.error('Error fetching user portfolios:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch portfolios'
      });
    }
  }

  /**
   * Get a specific portfolio by ID
   */
  static async getPortfolio(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const portfolioId = parseInt(id, 10);
      
      if (isNaN(portfolioId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid portfolio ID'
        });
        return;
      }

      const portfolio = await PortfolioService.getPortfolio(portfolioId);
      
      if (!portfolio) {
        res.status(404).json({
          success: false,
          error: 'Portfolio not found'
        });
        return;
      }

      // Remap portfolioUser to user to match frontend expectations and remove circular references
      const plainPortfolio = JSON.parse(JSON.stringify(portfolio));
      const mappedPortfolio = {
        ...plainPortfolio,
        user: plainPortfolio.portfolioUser
      };
      delete (mappedPortfolio as any).portfolioUser;
      
      res.status(200).json({
        success: true,
        portfolio: mappedPortfolio
      });
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch portfolio'
      });
    }
  }

  /**
   * Create a new portfolio entry
   */
  static async createPortfolio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const portfolioData: PortfolioCreationAttributes = req.body;

      // Validate required fields
      if (!portfolioData.title || !portfolioData.description) {
        res.status(400).json({
          success: false,
          error: 'Title and description are required'
        });
        return;
      }

      // Sanitize URL fields - convert empty strings to undefined
      if (portfolioData.image_url === '') {
        portfolioData.image_url = undefined;
      }
      if (portfolioData.link_url === '') {
        portfolioData.link_url = undefined;
      }

      const portfolio = await PortfolioService.createPortfolio(userId, portfolioData);
      
      // Since new portfolio doesn't have user data, we'll fetch it to include user info
      const fullPortfolio = await PortfolioService.getPortfolio(portfolio.id);
      
      if (fullPortfolio) {
        // Remap portfolioUser to user to match frontend expectations and remove circular references
        const plainPortfolio = JSON.parse(JSON.stringify(fullPortfolio));
        const mappedPortfolio = {
          ...plainPortfolio,
          user: plainPortfolio.portfolioUser
        };
        delete (mappedPortfolio as any).portfolioUser;
        
        res.status(201).json({
          success: true,
          portfolio: mappedPortfolio,
          message: 'Portfolio created successfully'
        });
      } else {
        // If we couldn't fetch the full portfolio, send the original portfolio
        res.status(201).json({
          success: true,
          portfolio,
          message: 'Portfolio created successfully'
        });
      }
    } catch (error: any) {
      console.error('Error creating portfolio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create portfolio'
      });
    }
  }

  /**
   * Update an existing portfolio entry
   */
  static async updatePortfolio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const portfolioId = parseInt(id, 10);
      const userId = req.user!.id;
      const updateData = req.body;

      if (isNaN(portfolioId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid portfolio ID'
        });
        return;
      }

      // Sanitize URL fields - convert empty strings to undefined
      if (updateData.image_url === '') {
        updateData.image_url = undefined;
      }
      if (updateData.link_url === '') {
        updateData.link_url = undefined;
      }

      const portfolio = await PortfolioService.updatePortfolio(portfolioId, userId, updateData);
      
      if (!portfolio) {
        res.status(404).json({
          success: false,
          error: 'Portfolio not found or you do not have permission to update it'
        });
        return;
      }

      // Fetch the updated portfolio with user data
      const fullPortfolio = await PortfolioService.getPortfolio(portfolio.id);
      
      if (fullPortfolio) {
        // Remap portfolioUser to user to match frontend expectations and remove circular references
        const plainPortfolio = JSON.parse(JSON.stringify(fullPortfolio));
        const mappedPortfolio = {
          ...plainPortfolio,
          user: plainPortfolio.portfolioUser
        };
        delete (mappedPortfolio as any).portfolioUser;
        
        res.status(200).json({
          success: true,
          portfolio: mappedPortfolio,
          message: 'Portfolio updated successfully'
        });
      } else {
        res.status(200).json({
          success: true,
          portfolio,
          message: 'Portfolio updated successfully'
        });
      }
    } catch (error: any) {
      console.error('Error updating portfolio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update portfolio'
      });
    }
  }

  /**
   * Delete a portfolio entry
   */
  static async deletePortfolio(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const portfolioId = parseInt(id, 10);
      const userId = req.user!.id;

      if (isNaN(portfolioId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid portfolio ID'
        });
        return;
      }

      const deleted = await PortfolioService.deletePortfolio(portfolioId, userId);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Portfolio not found or you do not have permission to delete it'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Portfolio deleted successfully'
      });
    } catch (error: any) {
      console.error('Error deleting portfolio:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete portfolio'
      });
    }
  }

  /**
   * Get all portfolios with pagination (for public viewing)
   */
  static async getPortfolios(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 10;
      const userId = req.query.userId ? parseInt(req.query.userId as string, 10) : undefined;

      // Validate pagination parameters
      if (page < 1 || limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          error: 'Invalid pagination parameters'
        });
        return;
      }

      const result = await PortfolioService.getPortfolios(page, limit, userId);
      
      // Remap portfolioUser to user to match frontend expectations and remove circular references
      const mappedPortfolios = result.portfolios.map(portfolio => {
        const plainPortfolio = JSON.parse(JSON.stringify(portfolio));
        const { portfolioUser, ...rest } = plainPortfolio;
        return {
          ...rest,
          user: portfolioUser
        };
      });
      
      res.status(200).json({
        success: true,
        ...result,
        portfolios: mappedPortfolios
      });
    } catch (error: any) {
      console.error('Error fetching portfolios:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch portfolios'
      });
    }
  }
}