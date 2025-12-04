import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Bill } from './bill.entity';
import { User } from './user.entity';
import { PaymentMethod } from '../enums/payment-method.enum';
import { PaymentStatus } from '../enums/payment-status.enum';
import { Patient } from './patient.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  @Index()                     // tạo index để query nhanh
  transaction_id?: string;     // PayOS orderCode sẽ được lưu ở đây

  @ManyToOne(() => Bill, (b) => b.payments)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  payment_method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  /** Nếu bệnh nhân có tài khoản (user) */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'paid_by_user_id' })
  paidByUser?: User | null;

  /** Nếu bệnh nhân không có tài khoản */
  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'paid_by_patient_id' })
  paidByPatient?: Patient | null;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  paid_at: Date;
}
