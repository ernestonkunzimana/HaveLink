import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProduceListing } from './ProduceListing';

@Entity('cooperatives')
export class Cooperative {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  registrationNumber: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  sector: string;

  @Column({ nullable: true })
  cell: string;

  @Column({ name: 'contact_person', nullable: true })
  contactPerson: string;

  @Column({ name: 'contact_phone', nullable: true })
  contactPhone: string;

  @Column({ name: 'contact_email', nullable: true })
  contactEmail: string;

  @Column({ name: 'member_count', default: 0 })
  memberCount: number;

  @Column({ name: 'total_land_hectares', type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalLandHectares: number;

  @Column({ name: 'primary_crops', type: 'jsonb', nullable: true })
  primaryCrops: string[];

  @Column({ name: 'mobile_money_account', nullable: true })
  mobileMoneyAccount: string;

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by', nullable: true })
  createdBy: string;

  @OneToMany(() => ProduceListing, (listing) => listing.cooperative)
  listings: ProduceListing[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
