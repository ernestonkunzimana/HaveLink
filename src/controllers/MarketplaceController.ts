import { Response } from 'express';
import { MarketplaceService } from '../services/MarketplaceService';
import { AuthenticatedRequest } from '../types';
import { logger } from '../config/logger';

export class MarketplaceController {
  private service: MarketplaceService;

  constructor() {
    this.service = new MarketplaceService();
  }

  async index(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        cropName: req.query.cropName as string,
        district: req.query.district as string,
        status: req.query.status as string,
      };
      const result = await this.service.findAll(options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('MarketplaceController.index error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async show(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.findById(req.params.id);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      logger.error('MarketplaceController.show error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async store(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.create(req.body, req.user.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('MarketplaceController.store error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.update(req.params.id, req.body, req.user.id);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('MarketplaceController.update error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async destroy(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.delete(req.params.id, req.user.id);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('MarketplaceController.destroy error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getByCooperative(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await this.service.getByCooperative(req.params.cooperativeId, options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('MarketplaceController.getByCooperative error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.getMarketStats();
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('MarketplaceController.getStats error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
