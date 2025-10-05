// src/shared/entities/bill.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToOne, OneToMany, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { MedicalTicket } from './medical-ticket.entity';
import { IndicationTicket } from './indication-ticket.entity';
import { Prescription } from './prescription.entity';
import { Payment } from './payment.entity';

@Entity({ name: 'bill' })
export class Bill {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  patient_id: string;

  @ManyToOne(() => Patient, (p) => p.bills)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'char', length: 36, nullable: true })
  doctor_id?: string;

  @ManyToOne(() => Staff, (s) => s.bills)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Staff;

  @Column({ type: 'char', length: 36, nullable: true })
  medical_ticket_id?: string;

  @OneToOne(() => MedicalTicket, (m) => m.bill)
  @JoinColumn({ name: 'medical_ticket_id' })
  medicalTicket?: MedicalTicket;

  @Column({ type: 'char', length: 36, nullable: true })
  indication_ticket_id?: string;

  @ManyToOne(() => IndicationTicket, (i) => i.bills)
  @JoinColumn({ name: 'indication_ticket_id' })
  indicationTicket?: IndicationTicket;

  @Column({ type: 'char', length: 36, nullable: true })
  prescription_id?: string;

  @ManyToOne(() => Prescription, (p) => p.bills)
  @JoinColumn({ name: 'prescription_id' })
  prescription?: Prescription;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  paid_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  remaining_amount: number;

  @Column({ length: 50 })
  status: string; // e.g. PAID / UNPAID / PARTIAL

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @OneToMany(() => Payment, (p) => p.bill)
  payments: Payment[];
}
