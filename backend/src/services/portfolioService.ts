import { Portfolio, User } from '../models';
import { PortfolioAttributes, PortfolioCreationAttributes } from '../models/Portfolio';

export interface PortfolioWithUser extends PortfolioAttributes {
  portfolioUser: {
    username: string;
    avatar_url?: string;
  };
}

export class PortfolioService {
  /**
   * Get all portfolios for a specific user
   */
  static async getUserPortfolios(userId: number): Promise<PortfolioWithUser[]> {
    try {
      const portfolios = await Portfolio.findAll({
        where: { user_id: userId },
        include: [{
          model: User,
          as: 'portfolioUser',
          attributes: ['username', 'avatar_url']
        }],
        order: [['created_at', 'DESC']]
      });
      
      return portfolios as any as PortfolioWithUser[];
    } catch (error) {
      console.error('Error fetching user portfolios:', error);
      throw new Error('Failed to fetch user portfolios');
    }
  }

  /**
   * Get a specific portfolio by ID
   */
  static async getPortfolio(portfolioId: number, userId?: number): Promise<PortfolioWithUser | null> {
    try {
      const whereCondition: any = { id: portfolioId };
      if (userId) {
        whereCondition.user_id = userId;
      }

      const portfolio = await Portfolio.findOne({
        where: whereCondition,
        include: [{
          model: User,
          as: 'portfolioUser',
          attributes: ['username', 'avatar_url']
        }]
      });
      
      return portfolio as PortfolioWithUser | null;
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      throw new Error('Failed to fetch portfolio');
    }
  }

  /**
   * Create a new portfolio entry
   */
  static async createPortfolio(userId: number, data: PortfolioCreationAttributes): Promise<PortfolioAttributes> {
    try {
      const portfolio = await Portfolio.create({
        ...data,
        user_id: userId
      });
      
      return portfolio.toJSON() as PortfolioAttributes;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw new Error('Failed to create portfolio');
    }
  }

  /**
   * Update an existing portfolio entry
   */
  static async updatePortfolio(portfolioId: number, userId: number, data: Partial<PortfolioCreationAttributes>): Promise<PortfolioAttributes | null> {
    try {
      const portfolio = await Portfolio.findOne({
        where: { id: portfolioId, user_id: userId }
      });

      if (!portfolio) {
        return null;
      }

      await portfolio.update(data);
      return portfolio.toJSON() as PortfolioAttributes;
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw new Error('Failed to update portfolio');
    }
  }

  /**
   * Delete a portfolio entry
   */
  static async deletePortfolio(portfolioId: number, userId: number): Promise<boolean> {
    try {
      const portfolio = await Portfolio.findOne({
        where: { id: portfolioId, user_id: userId }
      });

      if (!portfolio) {
        return false;
      }

      await portfolio.destroy();
      return true;
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw new Error('Failed to delete portfolio');
    }
  }

  /**
   * Get portfolios with pagination
   */
  static async getPortfolios(page: number = 1, limit: number = 10, userId?: number): Promise<{
    portfolios: PortfolioWithUser[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const offset = (page - 1) * limit;
      const whereCondition: any = {};
      
      if (userId) {
        whereCondition.user_id = userId;
      }

      const { count, rows } = await Portfolio.findAndCountAll({
        where: whereCondition,
        include: [{
          model: User,
          as: 'portfolioUser',
          attributes: ['username', 'avatar_url']
        }],
        limit,
        offset,
        order: [['created_at', 'DESC']]
      });

      return {
        portfolios: rows as any as PortfolioWithUser[],
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      throw new Error('Failed to fetch portfolios');
    }
  }
}