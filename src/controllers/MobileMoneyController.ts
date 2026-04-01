import { Response } from 'express';
import { MobileMoneyService } from '../services/MobileMoneyService';
import { AuthenticatedRequest } from '../types';
import { logger } from '../config/logger';

export class MobileMoneyController {
  private service: MobileMoneyService;

  constructor() {
    this.service = new MobileMoneyService();
  }

  async index(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await this.service.findAll(req.user.id, options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('MobileMoneyController.index error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async initiate(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.initiate(req.body, req.user.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('MobileMoneyController.initiate error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async releaseEscrow(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.releaseEscrow(req.params.id, req.user.id);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('MobileMoneyController.releaseEscrow error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.getStatus(req.params.reference);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      logger.error('MobileMoneyController.getStatus error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
