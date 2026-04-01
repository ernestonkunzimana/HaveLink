import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type MobileMoneyProvider = 'MTN' | 'Airtel' | 'Tigo' | 'Orange';
export type MobileMoneyStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'reversed' | 'escrowed' | 'released';
export type MobileMoneyType = 'payment' | 'payout' | 'escrow' | 'refund' | 'escrow_release';

@Entity('hl_mobile_money_transactions')
export class MobileMoneyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider', type: 'enum', enum: ['MTN', 'Airtel', 'Tigo', 'Orange'] })
  provider: MobileMoneyProvider;

  @Column({ name: 'transaction_type', type: 'enum', enum: ['payment', 'payout', 'escrow', 'refund', 'escrow_release'] })
  transactionType: MobileMoneyType;

  @Column({ name: 'sender_phone' })
  senderPhone: string;

  @Column({ name: 'receiver_phone' })
  receiverPhone: string;

  @Column({ name: 'sender_name', nullable: true })
  senderName: string;

  @Column({ name: 'receiver_name', nullable: true })
  receiverName: string;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: number;

  @Column({ default: 'RWF' })
  currency: string;

  @Column({ name: 'fee_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  feeAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 14, scale: 2 })
  netAmount: number;

  @Column({ type: 'enum', enum: ['pending', 'processing', 'completed', 'failed', 'reversed', 'escrowed', 'released'], default: 'pending' })
  status: MobileMoneyStatus;

  @Column({ name: 'external_reference', nullable: true })
  externalReference: string;

  @Column({ name: 'internal_reference', unique: true })
  internalReference: string;

  @Column({ name: 'bid_id', nullable: true })
  bidId: string;

  @Column({ name: 'listing_id', nullable: true })
  listingId: string;

  @Column({ name: 'escrow_released_at', nullable: true })
  escrowReleasedAt: Date;

  @Column({ name: 'failure_reason', nullable: true })
  failureReason: string;

  @Column({ name: 'initiated_by', nullable: true })
  initiatedBy: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
