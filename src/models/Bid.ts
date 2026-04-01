import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProduceListing } from './ProduceListing';

export type BidStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered' | 'expired';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'listing_id' })
  listingId: string;

  @ManyToOne(() => ProduceListing, (listing) => listing.bids)
  @JoinColumn({ name: 'listing_id' })
  listing: ProduceListing;

  @Column({ name: 'bidder_id' })
  bidderId: string;

  @Column({ name: 'bidder_name', nullable: true })
  bidderName: string;

  @Column({ name: 'bid_price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  bidPricePerKg: number;

  @Column({ name: 'quantity_kg', type: 'decimal', precision: 12, scale: 2 })
  quantityKg: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 14, scale: 2 })
  totalAmount: number;

  @Column({ default: 'RWF' })
  currency: string;

  @Column({ type: 'enum', enum: ['pending', 'accepted', 'rejected', 'withdrawn', 'countered', 'expired'], default: 'pending' })
  status: BidStatus;

  @Column({ nullable: true })
  message: string;

  @Column({ name: 'counter_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  counterPrice: number;

  @Column({ name: 'counter_message', nullable: true })
  counterMessage: string;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'payment_method', nullable: true })
  paymentMethod: string;

  @Column({ name: 'escrow_reference', nullable: true })
  escrowReference: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
