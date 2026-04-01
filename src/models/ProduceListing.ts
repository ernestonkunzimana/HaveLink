import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Cooperative } from './Cooperative';
import { Bid } from './Bid';

export type ListingStatus = 'draft' | 'active' | 'bidding' | 'sold' | 'expired' | 'cancelled';
export type ListingType = 'instant' | 'auction' | 'contract';

@Entity('produce_listings')
export class ProduceListing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cooperative_id' })
  cooperativeId: string;

  @ManyToOne(() => Cooperative, (coop) => coop.listings)
  @JoinColumn({ name: 'cooperative_id' })
  cooperative: Cooperative;

  @Column({ name: 'crop_name' })
  cropName: string;

  @Column({ nullable: true })
  variety: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ name: 'quantity_kg', type: 'decimal', precision: 12, scale: 2 })
  quantityKg: number;

  @Column({ name: 'available_kg', type: 'decimal', precision: 12, scale: 2 })
  availableKg: number;

  @Column({ name: 'price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  pricePerKg: number;

  @Column({ name: 'min_price_per_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPricePerKg: number;

  @Column({ default: 'RWF' })
  currency: string;

  @Column({ type: 'enum', enum: ['draft', 'active', 'bidding', 'sold', 'expired', 'cancelled'], default: 'draft' })
  status: ListingStatus;

  @Column({ name: 'listing_type', type: 'enum', enum: ['instant', 'auction', 'contract'], default: 'instant' })
  listingType: ListingType;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  district: string;

  @Column({ name: 'harvest_date', nullable: true })
  harvestDate: Date;

  @Column({ name: 'expiry_date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'images', type: 'jsonb', nullable: true })
  images: string[];

  @Column({ name: 'quality_certificate', nullable: true })
  qualityCertificate: string;

  @Column({ name: 'is_organic', default: false })
  isOrganic: boolean;

  @Column({ name: 'moisture_content', type: 'decimal', precision: 5, scale: 2, nullable: true })
  moistureContent: number;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'weighing_record_id', nullable: true })
  weighingRecordId: string;

  @OneToMany(() => Bid, (bid) => bid.listing)
  bids: Bid[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
