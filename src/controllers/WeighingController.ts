import { Response } from 'express';
import { WeighingService } from '../services/WeighingService';
import { AuthenticatedRequest } from '../types';
import { logger } from '../config/logger';

export class WeighingController {
  private service: WeighingService;

  constructor() {
    this.service = new WeighingService();
  }

  async index(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const cooperativeId = req.query.cooperativeId as string;
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      };
      const result = await this.service.findAll(cooperativeId, options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('WeighingController.index error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async show(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.findById(req.params.id);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      logger.error('WeighingController.show error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async store(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.recordWeighing(req.body, req.user.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('WeighingController.store error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async ingestIoT(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const deviceId = req.params.deviceId || req.body.deviceId;
      const result = await this.service.ingestIoTData(deviceId, req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('WeighingController.ingestIoT error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async verify(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.verifyRecord(req.params.id, req.user.id);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('WeighingController.verify error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const cooperativeId = req.query.cooperativeId as string;
      const result = await this.service.getWeighingStats(cooperativeId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('WeighingController.getStats error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
