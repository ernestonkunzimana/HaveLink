import { Response } from 'express';
import { BidService } from '../services/BidService';
import { AuthenticatedRequest } from '../types';
import { logger } from '../config/logger';

export class BidController {
  private service: BidService;

  constructor() {
    this.service = new BidService();
  }

  async getByListing(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await this.service.findByListing(req.params.listingId, options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('BidController.getByListing error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getMyBids(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await this.service.findByBidder(req.user.id, options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('BidController.getMyBids error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async store(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.placeBid(req.body, req.user.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('BidController.store error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async accept(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.acceptBid(req.params.id, req.user.id);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('BidController.accept error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async reject(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.rejectBid(req.params.id, req.user.id, req.body.reason);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('BidController.reject error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async withdraw(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.withdrawBid(req.params.id, req.user.id);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('BidController.withdraw error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
