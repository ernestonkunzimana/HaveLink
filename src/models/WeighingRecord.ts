import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type WeighingStatus = 'pending' | 'completed' | 'error' | 'calibrating';

@Entity('weighing_records')
export class WeighingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ name: 'device_name', nullable: true })
  deviceName: string;

  @Column({ name: 'cooperative_id', nullable: true })
  cooperativeId: string;

  @Column({ name: 'crop_name' })
  cropName: string;

  @Column({ nullable: true })
  variety: string;

  @Column({ name: 'gross_weight_kg', type: 'decimal', precision: 12, scale: 3 })
  grossWeightKg: number;

  @Column({ name: 'tare_weight_kg', type: 'decimal', precision: 12, scale: 3, default: 0 })
  tareWeightKg: number;

  @Column({ name: 'net_weight_kg', type: 'decimal', precision: 12, scale: 3 })
  netWeightKg: number;

  @Column({ name: 'moisture_content', type: 'decimal', precision: 5, scale: 2, nullable: true })
  moistureContent: number;

  @Column({ name: 'quality_grade', nullable: true })
  qualityGrade: string;

  @Column({ type: 'enum', enum: ['pending', 'completed', 'error', 'calibrating'], default: 'completed' })
  status: WeighingStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ name: 'farmer_name', nullable: true })
  farmerName: string;

  @Column({ name: 'farmer_id', nullable: true })
  farmerId: string;

  @Column({ name: 'operator_id', nullable: true })
  operatorId: string;

  @Column({ name: 'ticket_number', unique: true, nullable: true })
  ticketNumber: string;

  @Column({ name: 'iot_raw_data', type: 'jsonb', nullable: true })
  iotRawData: Record<string, any>;

  @Column({ name: 'listing_id', nullable: true })
  listingId: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'verified_by', nullable: true })
  verifiedBy: string;

  @Column({ name: 'verified_at', nullable: true })
  verifiedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
