import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('price_floors')
export class PriceFloor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'crop_name' })
  cropName: string;

  @Column({ nullable: true })
  variety: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ name: 'min_price_per_kg', type: 'decimal', precision: 10, scale: 2 })
  minPricePerKg: number;

  @Column({ name: 'max_price_per_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxPricePerKg: number;

  @Column({ name: 'reference_price_per_kg', type: 'decimal', precision: 10, scale: 2, nullable: true })
  referencePricePerKg: number;

  @Column({ default: 'RWF' })
  currency: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  region: string;

  @Column({ name: 'effective_from' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', nullable: true })
  effectiveTo: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'set_by' })
  setBy: string;

  @Column({ name: 'authority', nullable: true })
  authority: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ name: 'source_document', nullable: true })
  sourceDocument: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
