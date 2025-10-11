import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Prescription } from './prescription.entity';
import { MedicalTicket } from './medical-ticket.entity';
import { Payment } from './payment.entity';
import { BillType } from '../enums/bill-type.enum';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: BillType })
  billType: BillType;

  @ManyToOne(() => Patient)
  patient: Patient;

  @ManyToOne(() => Staff)
  doctor: Staff;

  @ManyToOne(() => Prescription, { nullable: true })
  prescription: Prescription;

  @ManyToOne(() => MedicalTicket, { nullable: true })
  medicalTicket: MedicalTicket;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Payment, (p) => p.bill)
  payments: Payment[];
}
