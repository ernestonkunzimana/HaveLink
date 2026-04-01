import { Repository } from 'typeorm';
import { Bid } from '../models/Bid';
import { ProduceListing } from '../models/ProduceListing';
import { AppDataSource } from '../config/database';
import { ApiResponse, PaginationOptions } from '../types';
import { logger } from '../config/logger';
import { io } from '../app';

export class BidService {
  private bidRepository: Repository<Bid>;
  private listingRepository: Repository<ProduceListing>;

  constructor() {
    this.bidRepository = AppDataSource.getRepository(Bid);
    this.listingRepository = AppDataSource.getRepository(ProduceListing);
  }

  async findByListing(listingId: string, options: PaginationOptions): Promise<ApiResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [bids, total] = await this.bidRepository.findAndCount({
        where: { listingId },
        order: { bidPricePerKg: 'DESC', createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Bids retrieved successfully',
        data: bids,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching bids:', error);
      return { success: false, message: 'Failed to fetch bids', error: error.message };
    }
  }

  async findByBidder(bidderId: string, options: PaginationOptions): Promise<ApiResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [bids, total] = await this.bidRepository.findAndCount({
        where: { bidderId },
        relations: ['listing', 'listing.cooperative'],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Bids retrieved successfully',
        data: bids,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching bidder bids:', error);
      return { success: false, message: 'Failed to fetch bids', error: error.message };
    }
  }

  async placeBid(data: Partial<Bid>, bidderId: string): Promise<ApiResponse> {
    try {
      const listing = await this.listingRepository.findOne({ where: { id: data.listingId } });
      if (!listing) {
        return { success: false, message: 'Listing not found' };
      }
      if (!['active', 'bidding'].includes(listing.status)) {
        return { success: false, message: 'This listing is not accepting bids' };
      }
      if (data.quantityKg > listing.availableKg) {
        return { success: false, message: `Requested quantity (${data.quantityKg}kg) exceeds available (${listing.availableKg}kg)` };
      }
      if (listing.minPricePerKg && data.bidPricePerKg < listing.minPricePerKg) {
        return { success: false, message: `Bid price is below minimum price of ${listing.minPricePerKg} RWF/kg` };
      }

      const totalAmount = data.bidPricePerKg * data.quantityKg;
      const bid = this.bidRepository.create({
        ...data,
        bidderId,
        totalAmount,
        status: 'pending',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      });

      const saved = await this.bidRepository.save(bid);

      // Update listing status to bidding if not already
      if (listing.status === 'active') {
        await this.listingRepository.update(listing.id, { status: 'bidding' });
      }

      // Notify cooperative
      io.to(`user_${listing.createdBy}`).emit('bidReceived', {
        bidId: saved.id,
        listingId: saved.listingId,
        cropName: listing.cropName,
        bidPricePerKg: saved.bidPricePerKg,
        quantityKg: saved.quantityKg,
        totalAmount: saved.totalAmount,
        bidderId,
        bidderName: data.bidderName,
      });

      return { success: true, message: 'Bid placed successfully', data: saved };
    } catch (error) {
      logger.error('Error placing bid:', error);
      return { success: false, message: 'Failed to place bid', error: error.message };
    }
  }

  async acceptBid(bidId: string, cooperativeUserId: string): Promise<ApiResponse> {
    try {
      const bid = await this.bidRepository.findOne({ where: { id: bidId }, relations: ['listing'] });
      if (!bid) {
        return { success: false, message: 'Bid not found' };
      }
      if (bid.listing.createdBy !== cooperativeUserId) {
        return { success: false, message: 'Unauthorized to accept this bid' };
      }
      if (bid.status !== 'pending') {
        return { success: false, message: `Bid is already ${bid.status}` };
      }

      await this.bidRepository.update(bidId, { status: 'accepted', acceptedAt: new Date() });

      // Reject other pending bids for same listing if quantity is fully allocated
      const updatedListing = await this.listingRepository.findOne({ where: { id: bid.listingId } });
      if (updatedListing) {
        const newAvailable = updatedListing.availableKg - bid.quantityKg;
        await this.listingRepository.update(bid.listingId, {
          availableKg: newAvailable,
          status: newAvailable <= 0 ? 'sold' : 'active',
        });
      }

      // Notify buyer
      io.to(`user_${bid.bidderId}`).emit('bidAccepted', {
        bidId,
        listingId: bid.listingId,
        cropName: bid.listing.cropName,
        totalAmount: bid.totalAmount,
      });

      return { success: true, message: 'Bid accepted successfully', data: { bidId, status: 'accepted' } };
    } catch (error) {
      logger.error('Error accepting bid:', error);
      return { success: false, message: 'Failed to accept bid', error: error.message };
    }
  }

  async rejectBid(bidId: string, cooperativeUserId: string, reason?: string): Promise<ApiResponse> {
    try {
      const bid = await this.bidRepository.findOne({ where: { id: bidId }, relations: ['listing'] });
      if (!bid) {
        return { success: false, message: 'Bid not found' };
      }
      if (bid.listing.createdBy !== cooperativeUserId) {
        return { success: false, message: 'Unauthorized to reject this bid' };
      }

      await this.bidRepository.update(bidId, { status: 'rejected', counterMessage: reason });

      io.to(`user_${bid.bidderId}`).emit('bidRejected', {
        bidId,
        listingId: bid.listingId,
        reason,
      });

      return { success: true, message: 'Bid rejected', data: { bidId, status: 'rejected' } };
    } catch (error) {
      logger.error('Error rejecting bid:', error);
      return { success: false, message: 'Failed to reject bid', error: error.message };
    }
  }

  async withdrawBid(bidId: string, bidderId: string): Promise<ApiResponse> {
    try {
      const bid = await this.bidRepository.findOne({ where: { id: bidId } });
      if (!bid) {
        return { success: false, message: 'Bid not found' };
      }
      if (bid.bidderId !== bidderId) {
        return { success: false, message: 'Unauthorized to withdraw this bid' };
      }
      if (!['pending', 'countered'].includes(bid.status)) {
        return { success: false, message: 'Bid cannot be withdrawn at this stage' };
      }

      await this.bidRepository.update(bidId, { status: 'withdrawn' });
      return { success: true, message: 'Bid withdrawn successfully', data: { bidId, status: 'withdrawn' } };
    } catch (error) {
      logger.error('Error withdrawing bid:', error);
      return { success: false, message: 'Failed to withdraw bid', error: error.message };
    }
  }
}
