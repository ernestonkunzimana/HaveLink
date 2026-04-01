import { Response } from 'express';
import { ComplianceService } from '../services/ComplianceService';
import { AuthenticatedRequest } from '../types';
import { logger } from '../config/logger';

export class ComplianceController {
  private service: ComplianceService;

  constructor() {
    this.service = new ComplianceService();
  }

  async getPriceFloors(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
        cropName: req.query.cropName as string,
        district: req.query.district as string,
        activeOnly: req.query.activeOnly === 'true',
      };
      const result = await this.service.getPriceFloors(options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('ComplianceController.getPriceFloors error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async setPriceFloor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.setPriceFloor(req.body, req.user.id);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      logger.error('ComplianceController.setPriceFloor error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async updatePriceFloor(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await this.service.updatePriceFloor(req.params.id, req.body);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('ComplianceController.updatePriceFloor error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getComplianceReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const options = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        district: req.query.district as string,
      };
      const result = await this.service.getComplianceReport(options);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('ComplianceController.getComplianceReport error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getMarketTrends(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const cropName = req.params.crop;
      const days = parseInt(req.query.days as string) || 30;
      const result = await this.service.getMarketTrends(cropName, days);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      logger.error('ComplianceController.getMarketTrends error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
