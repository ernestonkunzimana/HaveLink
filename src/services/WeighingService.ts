import { Repository } from 'typeorm';
import { WeighingRecord } from '../models/WeighingRecord';
import { AppDataSource } from '../config/database';
import { ApiResponse, PaginationOptions } from '../types';
import { logger } from '../config/logger';
import { io } from '../app';
import { v4 as uuidv4 } from 'uuid';

export class WeighingService {
  private weighingRepository: Repository<WeighingRecord>;

  constructor() {
    this.weighingRepository = AppDataSource.getRepository(WeighingRecord);
  }

  async findAll(cooperativeId: string, options: PaginationOptions): Promise<ApiResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [records, total] = await this.weighingRepository.findAndCount({
        where: cooperativeId ? { cooperativeId } : {},
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Weighing records retrieved successfully',
        data: records,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching weighing records:', error);
      return { success: false, message: 'Failed to fetch weighing records', error: error.message };
    }
  }

  async findById(id: string): Promise<ApiResponse> {
    try {
      const record = await this.weighingRepository.findOne({ where: { id } });
      if (!record) {
        return { success: false, message: 'Weighing record not found' };
      }
      return { success: true, message: 'Weighing record retrieved successfully', data: record };
    } catch (error) {
      logger.error('Error fetching weighing record:', error);
      return { success: false, message: 'Failed to fetch weighing record', error: error.message };
    }
  }

  async recordWeighing(data: Partial<WeighingRecord>, operatorId: string): Promise<ApiResponse> {
    try {
      const netWeightKg = data.grossWeightKg - (data.tareWeightKg || 0);
      const ticketNumber = `WGH-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

      const record = this.weighingRepository.create({
        ...data,
        netWeightKg,
        operatorId,
        ticketNumber,
        status: 'completed',
      });

      const saved = await this.weighingRepository.save(record);

      // Broadcast to cooperative room
      if (saved.cooperativeId) {
        io.to(`org_${saved.cooperativeId}`).emit('weighingCompleted', {
          id: saved.id,
          ticketNumber: saved.ticketNumber,
          cropName: saved.cropName,
          netWeightKg: saved.netWeightKg,
          farmerName: saved.farmerName,
          deviceId: saved.deviceId,
        });
      }

      return { success: true, message: 'Weighing record saved successfully', data: saved };
    } catch (error) {
      logger.error('Error recording weighing:', error);
      return { success: false, message: 'Failed to record weighing', error: error.message };
    }
  }

  async ingestIoTData(deviceId: string, rawData: Record<string, any>): Promise<ApiResponse> {
    try {
      // Parse IoT payload: { gross_kg, tare_kg, moisture, cooperative_id, crop_name, farmer_id }
      const grossWeightKg = parseFloat(rawData.gross_kg || rawData.grossKg || 0);
      const tareWeightKg = parseFloat(rawData.tare_kg || rawData.tareKg || 0);
      const netWeightKg = grossWeightKg - tareWeightKg;
      const ticketNumber = `IOT-${Date.now()}-${uuidv4().substring(0, 6).toUpperCase()}`;

      const record = this.weighingRepository.create({
        deviceId,
        cooperativeId: rawData.cooperative_id || rawData.cooperativeId,
        cropName: rawData.crop_name || rawData.cropName || 'Unknown',
        variety: rawData.variety,
        grossWeightKg,
        tareWeightKg,
        netWeightKg,
        moistureContent: rawData.moisture ? parseFloat(rawData.moisture) : undefined,
        qualityGrade: rawData.grade,
        farmerId: rawData.farmer_id || rawData.farmerId,
        farmerName: rawData.farmer_name || rawData.farmerName,
        location: rawData.location,
        ticketNumber,
        iotRawData: rawData,
        status: 'completed',
      });

      const saved = await this.weighingRepository.save(record);

      if (saved.cooperativeId) {
        io.to(`org_${saved.cooperativeId}`).emit('iotWeighingData', {
          id: saved.id,
          ticketNumber: saved.ticketNumber,
          cropName: saved.cropName,
          netWeightKg: saved.netWeightKg,
          deviceId,
        });
      }

      return { success: true, message: 'IoT weighing data ingested', data: saved };
    } catch (error) {
      logger.error('Error ingesting IoT data:', error);
      return { success: false, message: 'Failed to ingest IoT data', error: error.message };
    }
  }

  async verifyRecord(id: string, verifiedBy: string): Promise<ApiResponse> {
    try {
      const record = await this.weighingRepository.findOne({ where: { id } });
      if (!record) {
        return { success: false, message: 'Weighing record not found' };
      }

      await this.weighingRepository.update(id, { isVerified: true, verifiedBy, verifiedAt: new Date() });
      return { success: true, message: 'Weighing record verified', data: { id, isVerified: true } };
    } catch (error) {
      logger.error('Error verifying weighing record:', error);
      return { success: false, message: 'Failed to verify record', error: error.message };
    }
  }

  async getWeighingStats(cooperativeId?: string): Promise<ApiResponse> {
    try {
      const query = this.weighingRepository.createQueryBuilder('w')
        .select('w.cropName', 'crop')
        .addSelect('COUNT(*)', 'count')
        .addSelect('SUM(w.netWeightKg)', 'totalKg')
        .addSelect('AVG(w.moistureContent)', 'avgMoisture');

      if (cooperativeId) {
        query.where('w.cooperativeId = :cooperativeId', { cooperativeId });
      }

      const stats = await query
        .groupBy('w.cropName')
        .orderBy('totalKg', 'DESC')
        .getRawMany();

      const totalRecords = await this.weighingRepository.count(
        cooperativeId ? { where: { cooperativeId } } : {}
      );

      return { success: true, message: 'Stats retrieved', data: { stats, totalRecords } };
    } catch (error) {
      logger.error('Error fetching weighing stats:', error);
      return { success: false, message: 'Failed to fetch stats', error: error.message };
    }
  }
}
