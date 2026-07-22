import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Gig, Message, Contract, User } from '../models';
import { GigStatus } from '../models/Gig';
import { MessageStatus } from '../models/Message';
import { ContractStatus } from '../models/Contract';
import { AuthenticatedRequest } from '../middleware/auth';

export class MarketplaceController {

  // Gig CRUD operations
  async createGig(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const gigData = {
        ...req.body,
        freelancer_id: userId
      };

      const gig = await Gig.create(gigData);
      const gigWithFreelancer = await Gig.findByPk(gig.id, {
        include: [{
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'title', 'company']
        }]
      });

      res.status(201).json({
        success: true,
        gig: gigWithFreelancer
      });
    } catch (error: any) {
      console.error('Create gig error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create gig'
      });
    }
  }

  async getGigs(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        subcategory,
        minPrice,
        maxPrice,
        deliveryTime,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        freelancer_id // Allow filtering by freelancer_id
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = { status: 'active' };

      // Apply filters
      if (category) whereClause.category = category;
      if (subcategory) whereClause.subcategory = subcategory;
      if (minPrice || maxPrice) {
        whereClause.price = {};
        if (minPrice) whereClause.price[Op.gte] = minPrice;
        if (maxPrice) whereClause.price[Op.lte] = maxPrice;
      }
      if (deliveryTime) whereClause.delivery_time = { [Op.lte]: deliveryTime };
      
      // Allow filtering by freelancer_id (for profile pages)
      if (freelancer_id) whereClause.freelancer_id = freelancer_id;

      // Search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { tags: { [Op.contains]: [search] } }
        ];
      }

      const gigs = await Gig.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'title', 'company']
        }],
        limit: Number(limit),
        offset,
        order: [[sortBy as string, sortOrder as string]]
      });

      res.json({
        success: true,
        gigs: gigs.rows,
        pagination: {
          total: gigs.count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(gigs.count / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get gigs error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch gigs'
      });
    }
  }

  async getGigById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const gig = await Gig.findByPk(id, {
        include: [{
          model: User,
          as: 'freelancer',
          attributes: ['id', 'username', 'avatar_url', 'title', 'company', 'bio', 'location', 'skills']
        }]
      });

      if (!gig) {
        return res.status(404).json({
          success: false,
          error: 'Gig not found'
        });
      }

      // If the gig is not active and the requesting user is not the freelancer, deny access
      if (gig.status !== 'active' && req.user && req.user.id !== gig.freelancer_id) {
        return res.status(403).json({
          success: false,
          error: 'Gig is not available'
        });
      }

      res.json({
        success: true,
        gig
      });
    } catch (error: any) {
      console.error('Get gig error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch gig'
      });
    }
  }

  async updateGig(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const gig = await Gig.findOne({
        where: { id, freelancer_id: userId }
      });

      if (!gig) {
        return res.status(404).json({
          success: false,
          error: 'Gig not found or unauthorized'
        });
      }

      await gig.update(req.body);

      res.json({
        success: true,
        gig
      });
    } catch (error: any) {
      console.error('Update gig error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update gig'
      });
    }
  }

  async deleteGig(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const gig = await Gig.findOne({
        where: { id, freelancer_id: userId }
      });

      if (!gig) {
        return res.status(404).json({
          success: false,
          error: 'Gig not found or unauthorized'
        });
      }

      await gig.update({ status: GigStatus.DELETED });

      res.json({
        success: true,
        message: 'Gig deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete gig error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete gig'
      });
    }
  }

  // Message operations
  async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const senderId = req.user!.id;
      const { receiver_id, gig_id, contract_id, content, message_type, file_url, file_name, file_size } = req.body;

      const message = await Message.create({
        sender_id: senderId,
        receiver_id,
        gig_id,
        contract_id,
        content,
        message_type: message_type || 'text',
        file_url,
        file_name,
        file_size,
        status: MessageStatus.SENT
      });

      const messageWithUsers = await Message.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
          { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: messageWithUsers
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to send message'
      });
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { other_user_id, gig_id, contract_id, page = 1, limit = 50 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      };

      if (other_user_id) {
        whereClause[Op.and] = [
          {
            [Op.or]: [
              { sender_id: other_user_id, receiver_id: userId },
              { sender_id: userId, receiver_id: other_user_id }
            ]
          }
        ];
      }

      if (gig_id) whereClause.gig_id = gig_id;
      if (contract_id) whereClause.contract_id = contract_id;

      const messages = await Message.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
          { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url'] }
        ],
        limit: Number(limit),
        offset,
        order: [['created_at', 'ASC']]
      });

      // Mark messages as read
      if (messages.rows.length > 0) {
        await Message.update(
          { is_read: true, read_at: new Date() },
          {
            where: {
              receiver_id: userId,
              is_read: false,
              id: messages.rows.map(m => m.id)
            }
          }
        );
      }

      res.json({
        success: true,
        messages: messages.rows,
        pagination: {
          total: messages.count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(messages.count / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages'
      });
    }
  }

  async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Get all unique conversations (grouped by other user)
      const conversations = await Message.findAll({
        where: {
          [Op.or]: [
            { sender_id: userId },
            { receiver_id: userId }
          ]
        },
        attributes: [
          [Message.sequelize!.fn('MAX', Message.sequelize!.col('created_at')), 'last_message_time'],
          [
            Message.sequelize!.literal(`CASE WHEN sender_id = ${userId} THEN receiver_id ELSE sender_id END`),
            'other_user_id'
          ]
        ],
        group: ['other_user_id'],
        order: [[Message.sequelize!.fn('MAX', Message.sequelize!.col('created_at')), 'DESC']],
        raw: true
      });

      // Get conversation details for each
      const conversationDetails = await Promise.all(
        conversations.map(async (conv: any) => {
          const otherUserId = conv.other_user_id;
          const lastMessage = await Message.findOne({
            where: {
              [Op.or]: [
                { sender_id: userId, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: userId }
              ]
            },
            order: [['created_at', 'DESC']],
            include: [
              { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
              { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url'] }
            ]
          });

          const unreadCount = await Message.count({
            where: {
              sender_id: otherUserId,
              receiver_id: userId,
              is_read: false
            }
          });

          const messageWithUsers = lastMessage as any; // Type assertion for associations

          return {
            other_user: messageWithUsers?.sender?.id === userId ? messageWithUsers?.receiver : messageWithUsers?.sender,
            last_message: messageWithUsers,
            unread_count: unreadCount
          };
        })
      );

      res.json({
        success: true,
        conversations: conversationDetails
      });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch conversations'
      });
    }
  }

  // Contract operations
  async createContract(req: AuthenticatedRequest, res: Response) {
    try {
      const clientId = req.user!.id;
      const { gig_id, freelancer_id, title, description, price, delivery_time, requirements, deliverables } = req.body;

      // Verify the gig exists and is active
      const gig = await Gig.findOne({
        where: { id: gig_id, status: 'active' }
      });

      if (!gig) {
        return res.status(404).json({
          success: false,
          error: 'Gig not found or unavailable'
        });
      }

      if (gig.freelancer_id === clientId) {
        return res.status(400).json({
          success: false,
          error: 'Cannot hire yourself'
        });
      }

      const contract = await Contract.create({
        gig_id,
        client_id: clientId,
        freelancer_id: gig.freelancer_id,
        title,
        description,
        price,
        delivery_time,
        revisions_included: gig.revisions,
        requirements: requirements || [],
        deliverables: deliverables || [],
        attachments: []
      });

      const contractWithDetails = await Contract.findByPk(contract.id, {
        include: [
          { model: Gig, as: 'gig', include: [{ model: User, as: 'freelancer' }] },
          { model: User, as: 'client' },
          { model: User, as: 'freelancer' }
        ]
      });

      res.status(201).json({
        success: true,
        contract: contractWithDetails
      });
    } catch (error: any) {
      console.error('Create contract error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create contract'
      });
    }
  }

  async getContracts(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, page = 1, limit = 20 } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      const whereClause: any = {
        [Op.or]: [
          { client_id: userId },
          { freelancer_id: userId }
        ]
      };

      if (status) whereClause.contract_status = status;

      const contracts = await Contract.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Gig,
            as: 'gig',
            include: [{ model: User, as: 'freelancer', attributes: ['id', 'username', 'avatar_url'] }]
          },
          { model: User, as: 'client', attributes: ['id', 'username', 'avatar_url'] },
          { model: User, as: 'freelancer', attributes: ['id', 'username', 'avatar_url'] }
        ],
        limit: Number(limit),
        offset,
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        contracts: contracts.rows,
        pagination: {
          total: contracts.count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(contracts.count / Number(limit))
        }
      });
    } catch (error: any) {
      console.error('Get contracts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch contracts'
      });
    }
  }

  async getMyContracts(req: AuthenticatedRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      // Get contracts where the user is the client (buyer)
      const where: any = { client_id: req.user?.id };

      if (status) where.contract_status = status;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const contracts = await Contract.findAll({
        where,
        limit: Number(limit),
        offset,
        order: [[sortBy as string, sortOrder as string]],
        include: [
          {
            model: User,
            as: 'freelancer',
            attributes: ['id', 'username', 'avatar_url', 'total_points', 'rating']
          },
          {
            model: Gig,
            as: 'gig',
            attributes: ['id', 'title', 'price', 'delivery_time', 'description']
          }
        ]
      });

      const total = await Contract.count({ where });
      const totalPages = Math.ceil(total / Number(limit));

      // Transform the contracts to match the frontend requirements
      const transformedContracts = contracts.map(contract => {
        // Calculate progress based on contract status
        let progress = 0;
        switch (contract.contract_status) {
          case ContractStatus.PENDING:
            progress = 0;
            break;
          case ContractStatus.ACCEPTED:
          case ContractStatus.IN_PROGRESS:
            progress = 25;
            break;
          case ContractStatus.DELIVERED:
          case ContractStatus.REVISION_REQUESTED:
            progress = 75;
            break;
          case ContractStatus.APPROVED:
          case ContractStatus.COMPLETED:
            progress = 100;
            break;
          case ContractStatus.CANCELLED:
          case ContractStatus.DISPUTED:
            progress = 0;
            break;
          default:
            progress = 0;
        }

        return {
          id: contract.id,
          title: contract.title,
          description: contract.description,
          price: contract.price,
          status: contract.contract_status,
          created_at: contract.created_at,
          deadline: contract.deadline,
          progress,
          client_rating: contract.client_rating,
          freelancer: {
            id: (contract as any).freelancer.id,
            username: (contract as any).freelancer.username,
            rating: (contract as any).freelancer.rating || 0
          },
          gig: {
            id: (contract as any).gig.id,
            title: (contract as any).gig.title
          }
        };
      });

      res.json({
        contracts: transformedContracts,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalItems: total,
          itemsPerPage: Number(limit)
        }
      });
    } catch (error: any) {
      console.error('Error fetching user contracts:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch contracts'
      });
    }
  }

  async updateContractStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { status, notes } = req.body;

      const contract = await Contract.findOne({
        where: {
          id,
          [Op.or]: [
            { client_id: userId },
            { freelancer_id: userId }
          ]
        }
      });

      if (!contract) {
        return res.status(404).json({
          success: false,
          error: 'Contract not found or unauthorized'
        });
      }

      // Update status and related timestamps
      const updateData: any = { contract_status: status };

      switch (status) {
        case 'accepted':
          if (contract.freelancer_id !== userId) {
            return res.status(403).json({ success: false, error: 'Only freelancer can accept contract' });
          }
          updateData.started_at = new Date();
          updateData.deadline = new Date(Date.now() + (contract.delivery_time * 24 * 60 * 60 * 1000));
          break;
        case 'completed':
          updateData.completed_at = new Date();
          break;
        case 'delivered':
          updateData.delivered_at = new Date();
          break;
        case 'approved':
          updateData.approved_at = new Date();
          break;
        case 'cancelled':
          updateData.cancelled_at = new Date();
          updateData.cancellation_reason = notes;
          break;
      }

      await contract.update(updateData);

      res.json({
        success: true,
        contract
      });
    } catch (error: any) {
      console.error('Update contract status error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update contract status'
      });
    }
  }
}

export const marketplaceController = new MarketplaceController();