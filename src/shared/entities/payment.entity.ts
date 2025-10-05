// src/shared/entities/payment.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Bill } from './bill.entity';
import { User } from './user.entity';

export enum PaymentMethod {
  CASH = 'CASH',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
}

@Entity({ name: 'payment' })
export class Payment {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  bill_id: string;

  @ManyToOne(() => Bill, (b) => b.payments)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ type: 'char', length: 36, nullable: true })
  paid_by?: string;

  @ManyToOne(() => User, (u) => u.payments)
  @JoinColumn({ name: 'paid_by' })
  paid_by_user?: User;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ length: 100, nullable: true })
  reference_number?: string;

  @Column({ length: 200, nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'datetime' })
  paid_at: Date;
}
