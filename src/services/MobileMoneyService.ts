import { Repository } from 'typeorm';
import { MobileMoneyTransaction } from '../models/MobileMoneyTransaction';
import { AppDataSource } from '../config/database';
import { ApiResponse, PaginationOptions } from '../types';
import { logger } from '../config/logger';
import { io } from '../app';
import { v4 as uuidv4 } from 'uuid';

export class MobileMoneyService {
  private txRepository: Repository<MobileMoneyTransaction>;

  constructor() {
    this.txRepository = AppDataSource.getRepository(MobileMoneyTransaction);
  }

  async findAll(userId: string, options: PaginationOptions): Promise<ApiResponse> {
    try {
      const page = options.page || 1;
      const limit = options.limit || 20;
      const skip = (page - 1) * limit;

      const [txs, total] = await this.txRepository.findAndCount({
        where: [{ initiatedBy: userId }],
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        success: true,
        message: 'Transactions retrieved',
        data: txs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      };
    } catch (error) {
      logger.error('Error fetching mobile money transactions:', error);
      return { success: false, message: 'Failed to fetch transactions', error: error.message };
    }
  }

  async initiate(data: {
    provider: 'MTN' | 'Airtel' | 'Tigo' | 'Orange';
    transactionType: 'payment' | 'payout' | 'escrow' | 'refund' | 'escrow_release';
    senderPhone: string;
    receiverPhone: string;
    senderName?: string;
    receiverName?: string;
    amount: number;
    currency?: string;
    bidId?: string;
    listingId?: string;
    metadata?: Record<string, any>;
  }, initiatedBy: string): Promise<ApiResponse> {
    try {
      // Fee calculation (simplified: 1% for MTN/Airtel, min 100 RWF)
      const feeRate = data.provider === 'MTN' || data.provider === 'Airtel' ? 0.01 : 0.015;
      const feeAmount = Math.max(100, data.amount * feeRate);
      const netAmount = data.transactionType === 'payment' ? data.amount - feeAmount : data.amount;

      const internalReference = `HL-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

      const tx = this.txRepository.create({
        ...data,
        currency: data.currency || 'RWF',
        feeAmount,
        netAmount,
        internalReference,
        initiatedBy,
        status: 'pending',
      });

      const saved = await this.txRepository.save(tx);

      // In development/simulation mode, simulate async provider callback
      if (process.env.MOBILE_MONEY_SIMULATION === 'true' || process.env.NODE_ENV === 'development') {
        setTimeout(async () => {
          try {
            const success = Math.random() > 0.05;
            const newStatus = success ? (data.transactionType === 'escrow' ? 'escrowed' : 'completed') : 'failed';
            await this.txRepository.update(saved.id, {
              status: newStatus,
              externalReference: success ? `EXT-${uuidv4().substring(0, 8).toUpperCase()}` : undefined,
              failureReason: success ? undefined : 'Insufficient funds',
            });

            io.to(`user_${initiatedBy}`).emit('paymentStatusUpdate', {
              transactionId: saved.id,
              internalReference,
              status: newStatus,
              amount: saved.amount,
              provider: saved.provider,
            });
          } catch (e) {
            logger.error('Error updating simulated payment:', e);
          }
        }, 3000);
      }

      return {
        success: true,
        message: 'Payment initiated. You will be notified when complete.',
        data: { id: saved.id, internalReference, status: 'pending' },
      };
    } catch (error) {
      logger.error('Error initiating mobile money:', error);
      return { success: false, message: 'Failed to initiate payment', error: error.message };
    }
  }

  async releaseEscrow(txId: string, authorizedBy: string): Promise<ApiResponse> {
    try {
      const tx = await this.txRepository.findOne({ where: { id: txId } });
      if (!tx) {
        return { success: false, message: 'Transaction not found' };
      }
      if (tx.status !== 'escrowed') {
        return { success: false, message: 'Transaction is not in escrow' };
      }

      await this.txRepository.update(txId, {
        status: 'released',
        escrowReleasedAt: new Date(),
        metadata: { ...tx.metadata, releasedBy: authorizedBy },
      });

      io.to(`user_${tx.initiatedBy}`).emit('escrowReleased', {
        transactionId: txId,
        amount: tx.amount,
        provider: tx.provider,
      });

      return { success: true, message: 'Escrow released successfully', data: { txId, status: 'released' } };
    } catch (error) {
      logger.error('Error releasing escrow:', error);
      return { success: false, message: 'Failed to release escrow', error: error.message };
    }
  }

  async getStatus(internalReference: string): Promise<ApiResponse> {
    try {
      const tx = await this.txRepository.findOne({ where: { internalReference } });
      if (!tx) {
        return { success: false, message: 'Transaction not found' };
      }
      return { success: true, message: 'Transaction status retrieved', data: tx };
    } catch (error) {
      logger.error('Error fetching transaction status:', error);
      return { success: false, message: 'Failed to get transaction status', error: error.message };
    }
  }
}
