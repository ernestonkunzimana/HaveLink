import { Repository } from 'typeorm';
import { ProduceListing } from '../models/ProduceListing';
import { PriceFloor } from '../models/PriceFloor';
import { AppDataSource } from '../config/database';
import { ApiResponse, PaginationOptions } from '../types';
import { logger } from '../config/logger';
import { io } from '../app';

export class MarketplaceService {
  private listingRepository: Repository<ProduceListing>;
  private priceFloorRepository: Repository<PriceFloor>;

  constructor() {
    this.listingRepository = AppDataSource.getRepository(ProduceListing);
    this.priceFloorRepository = AppDataSource.getRepository(PriceFloor);
  }

  async findAll(options: PaginationOptions & { cropName?: string; district?: string; status?: string }): Promise<ApiResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const query = this.listingRepository.createQueryBuilder('listing')
        .leftJoinAndSelect('listing.cooperative', 'cooperative')
        .leftJoinAndSelect('listing.bids', 'bids')
        .orderBy('listing.createdAt', 'DESC')
        .skip(skip)
        .take(limit);

      if (options.cropName) {
        query.andWhere('LOWER(listing.cropName) LIKE :crop', { crop: `%${options.cropName.toLowerCase()}%` });
      }
      if (options.district) {
        query.andWhere('listing.district = :district', { district: options.district });
      }
      if (options.status) {
        query.andWhere('listing.status = :status', { status: options.status });
      } else {
        query.andWhere('listing.status IN (:...statuses)', { statuses: ['active', 'bidding'] });
      }

      const [listings, total] = await query.getManyAndCount();

      return {
        success: true,
        message: 'Listings retrieved successfully',
        data: listings,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching listings:', error);
      return { success: false, message: 'Failed to fetch listings', error: error.message };
    }
  }

  async findById(id: string): Promise<ApiResponse> {
    try {
      const listing = await this.listingRepository.findOne({
        where: { id },
        relations: ['cooperative', 'bids'],
      });

      if (!listing) {
        return { success: false, message: 'Listing not found' };
      }

      // Attach current price floor if available
      const priceFloor = await this.getCurrentPriceFloor(listing.cropName, listing.district);

      return {
        success: true,
        message: 'Listing retrieved successfully',
        data: { ...listing, priceFloor },
      };
    } catch (error) {
      logger.error('Error fetching listing:', error);
      return { success: false, message: 'Failed to fetch listing', error: error.message };
    }
  }

  async create(data: Partial<ProduceListing>, userId: string): Promise<ApiResponse> {
    try {
      // Validate against price floor
      if (data.cropName) {
        const priceFloor = await this.getCurrentPriceFloor(data.cropName, data.district);
        if (priceFloor && data.pricePerKg && data.pricePerKg < priceFloor.minPricePerKg) {
          return {
            success: false,
            message: `Price per kg (${data.pricePerKg}) is below the government minimum price floor (${priceFloor.minPricePerKg} RWF/kg) for ${data.cropName}.`,
          };
        }
      }

      const listing = this.listingRepository.create({
        ...data,
        availableKg: data.quantityKg,
        createdBy: userId,
        status: 'active',
      });

      const saved = await this.listingRepository.save(listing);

      // Broadcast new listing to all buyers
      io.emit('newListing', {
        id: saved.id,
        cropName: saved.cropName,
        quantityKg: saved.quantityKg,
        pricePerKg: saved.pricePerKg,
        district: saved.district,
        cooperativeId: saved.cooperativeId,
      });

      return { success: true, message: 'Listing created successfully', data: saved };
    } catch (error) {
      logger.error('Error creating listing:', error);
      return { success: false, message: 'Failed to create listing', error: error.message };
    }
  }

  async update(id: string, data: Partial<ProduceListing>, userId: string): Promise<ApiResponse> {
    try {
      const listing = await this.listingRepository.findOne({ where: { id } });
      if (!listing) {
        return { success: false, message: 'Listing not found' };
      }

      if (listing.createdBy !== userId) {
        return { success: false, message: 'Unauthorized to update this listing' };
      }

      await this.listingRepository.update(id, data);
      const updated = await this.listingRepository.findOne({ where: { id }, relations: ['cooperative', 'bids'] });

      return { success: true, message: 'Listing updated successfully', data: updated };
    } catch (error) {
      logger.error('Error updating listing:', error);
      return { success: false, message: 'Failed to update listing', error: error.message };
    }
  }

  async delete(id: string, userId: string): Promise<ApiResponse> {
    try {
      const listing = await this.listingRepository.findOne({ where: { id } });
      if (!listing) {
        return { success: false, message: 'Listing not found' };
      }
      if (listing.createdBy !== userId) {
        return { success: false, message: 'Unauthorized to delete this listing' };
      }
      if (listing.status === 'sold') {
        return { success: false, message: 'Cannot delete a completed listing' };
      }

      await this.listingRepository.update(id, { status: 'cancelled' });
      return { success: true, message: 'Listing cancelled successfully' };
    } catch (error) {
      logger.error('Error deleting listing:', error);
      return { success: false, message: 'Failed to delete listing', error: error.message };
    }
  }

  async getByCooperative(cooperativeId: string, options: PaginationOptions): Promise<ApiResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [listings, total] = await this.listingRepository.findAndCount({
        where: { cooperativeId },
        relations: ['bids'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Listings retrieved successfully',
        data: listings,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching cooperative listings:', error);
      return { success: false, message: 'Failed to fetch listings', error: error.message };
    }
  }

  async getMarketStats(): Promise<ApiResponse> {
    try {
      const totalListings = await this.listingRepository.count({ where: { status: 'active' } });
      const totalVolume = await this.listingRepository
        .createQueryBuilder('l')
        .select('SUM(l.availableKg)', 'total')
        .where('l.status IN (:...s)', { s: ['active', 'bidding'] })
        .getRawOne();

      const topCrops = await this.listingRepository
        .createQueryBuilder('l')
        .select('l.cropName', 'crop')
        .addSelect('COUNT(*)', 'count')
        .addSelect('AVG(l.pricePerKg)', 'avgPrice')
        .where('l.status IN (:...s)', { s: ['active', 'bidding'] })
        .groupBy('l.cropName')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      return {
        success: true,
        message: 'Market stats retrieved',
        data: {
          totalActiveListings: totalListings,
          totalVolumeKg: parseFloat(totalVolume?.total || '0'),
          topCrops,
        },
      };
    } catch (error) {
      logger.error('Error fetching market stats:', error);
      return { success: false, message: 'Failed to fetch market stats', error: error.message };
    }
  }

  private async getCurrentPriceFloor(cropName: string, district?: string): Promise<PriceFloor | null> {
    try {
      const now = new Date();
      const query = this.priceFloorRepository.createQueryBuilder('pf')
        .where('LOWER(pf.cropName) = LOWER(:crop)', { crop: cropName })
        .andWhere('pf.isActive = true')
        .andWhere('pf.effectiveFrom <= :now', { now })
        .andWhere('(pf.effectiveTo IS NULL OR pf.effectiveTo >= :now)', { now });

      if (district) {
        query.andWhere('(pf.district = :district OR pf.district IS NULL)', { district });
      }

      return await query.orderBy('pf.district', 'DESC').getOne();
    } catch (error) {
      logger.error('Error fetching price floor:', error);
      return null;
    }
  }
}
