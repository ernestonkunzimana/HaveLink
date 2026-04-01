import { Repository } from 'typeorm';
import { PriceFloor } from '../models/PriceFloor';
import { ProduceListing } from '../models/ProduceListing';
import { AppDataSource } from '../config/database';
import { ApiResponse, PaginationOptions } from '../types';
import { logger } from '../config/logger';

export class ComplianceService {
  private priceFloorRepository: Repository<PriceFloor>;
  private listingRepository: Repository<ProduceListing>;

  constructor() {
    this.priceFloorRepository = AppDataSource.getRepository(PriceFloor);
    this.listingRepository = AppDataSource.getRepository(ProduceListing);
  }

  async getPriceFloors(options: PaginationOptions & { cropName?: string; district?: string; activeOnly?: boolean }): Promise<ApiResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const query = this.priceFloorRepository.createQueryBuilder('pf')
        .orderBy('pf.effectiveFrom', 'DESC')
        .skip(skip)
        .take(limit);

      if (options.cropName) {
        query.andWhere('LOWER(pf.cropName) LIKE :crop', { crop: `%${options.cropName.toLowerCase()}%` });
      }
      if (options.district) {
        query.andWhere('pf.district = :district', { district: options.district });
      }
      if (options.activeOnly) {
        const now = new Date();
        query.andWhere('pf.isActive = true')
          .andWhere('pf.effectiveFrom <= :now', { now })
          .andWhere('(pf.effectiveTo IS NULL OR pf.effectiveTo >= :now)', { now });
      }

      const [floors, total] = await query.getManyAndCount();

      return {
        success: true,
        message: 'Price floors retrieved successfully',
        data: floors,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching price floors:', error);
      return { success: false, message: 'Failed to fetch price floors', error: error.message };
    }
  }

  async setPriceFloor(data: Partial<PriceFloor>, setBy: string): Promise<ApiResponse> {
    try {
      const floor = this.priceFloorRepository.create({ ...data, setBy });
      const saved = await this.priceFloorRepository.save(floor);
      return { success: true, message: 'Price floor set successfully', data: saved };
    } catch (error) {
      logger.error('Error setting price floor:', error);
      return { success: false, message: 'Failed to set price floor', error: error.message };
    }
  }

  async updatePriceFloor(id: string, data: Partial<PriceFloor>): Promise<ApiResponse> {
    try {
      const floor = await this.priceFloorRepository.findOne({ where: { id } });
      if (!floor) {
        return { success: false, message: 'Price floor not found' };
      }
      await this.priceFloorRepository.update(id, data);
      const updated = await this.priceFloorRepository.findOne({ where: { id } });
      return { success: true, message: 'Price floor updated successfully', data: updated };
    } catch (error) {
      logger.error('Error updating price floor:', error);
      return { success: false, message: 'Failed to update price floor', error: error.message };
    }
  }

  async getComplianceReport(options: { startDate?: Date; endDate?: Date; district?: string }): Promise<ApiResponse> {
    try {
      const now = new Date();
      const startDate = options.startDate || new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = options.endDate || now;

      // Listings below price floor
      const violationsQuery = this.listingRepository.createQueryBuilder('l')
        .innerJoin(PriceFloor, 'pf', 'LOWER(pf.cropName) = LOWER(l.cropName) AND pf.isActive = true')
        .select('l.cropName', 'cropName')
        .addSelect('l.district', 'district')
        .addSelect('COUNT(l.id)', 'violationCount')
        .addSelect('AVG(l.pricePerKg)', 'avgListedPrice')
        .addSelect('MIN(pf.minPricePerKg)', 'priceFloor')
        .where('l.pricePerKg < pf.minPricePerKg')
        .andWhere('l.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate });

      if (options.district) {
        violationsQuery.andWhere('l.district = :district', { district: options.district });
      }

      const violations = await violationsQuery
        .groupBy('l.cropName, l.district')
        .getRawMany();

      // Market summary
      const marketSummary = await this.listingRepository.createQueryBuilder('l')
        .select('l.cropName', 'cropName')
        .addSelect('COUNT(l.id)', 'totalListings')
        .addSelect('SUM(l.quantityKg)', 'totalVolumeKg')
        .addSelect('AVG(l.pricePerKg)', 'avgPrice')
        .addSelect('MIN(l.pricePerKg)', 'minPrice')
        .addSelect('MAX(l.pricePerKg)', 'maxPrice')
        .where('l.createdAt BETWEEN :start AND :end', { start: startDate, end: endDate })
        .groupBy('l.cropName')
        .orderBy('totalVolumeKg', 'DESC')
        .getRawMany();

      return {
        success: true,
        message: 'Compliance report generated',
        data: {
          period: { startDate, endDate },
          violations,
          marketSummary,
          totalViolations: violations.reduce((sum, v) => sum + parseInt(v.violationCount), 0),
        },
      };
    } catch (error) {
      logger.error('Error generating compliance report:', error);
      return { success: false, message: 'Failed to generate compliance report', error: error.message };
    }
  }

  async getMarketTrends(cropName: string, days: number = 30): Promise<ApiResponse> {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);

      const trends = await this.listingRepository.createQueryBuilder('l')
        .select("DATE_TRUNC('day', l.createdAt)", 'date')
        .addSelect('AVG(l.pricePerKg)', 'avgPrice')
        .addSelect('SUM(l.quantityKg)', 'totalVolume')
        .addSelect('COUNT(l.id)', 'listingCount')
        .where('LOWER(l.cropName) = LOWER(:crop)', { crop: cropName })
        .andWhere('l.createdAt >= :since', { since })
        .groupBy("DATE_TRUNC('day', l.createdAt)")
        .orderBy('date', 'ASC')
        .getRawMany();

      return {
        success: true,
        message: 'Market trends retrieved',
        data: { cropName, trends, periodDays: days },
      };
    } catch (error) {
      logger.error('Error fetching market trends:', error);
      return { success: false, message: 'Failed to fetch market trends', error: error.message };
    }
  }
}
