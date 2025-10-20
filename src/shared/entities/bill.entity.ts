import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Prescription } from './prescription.entity';
import { MedicalTicket } from './medical-ticket.entity';
import { Payment } from './payment.entity';
import { BillType } from '../enums/bill-type.enum';
import { IndicationTicket } from './indication-ticket.entity';

@Entity()
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'enum', enum: BillType })
  bill_type: BillType;

  @ManyToOne(() => Patient)
  @JoinColumn( { name: 'patient_id'})
  patient: Patient;

  @ManyToOne(() => Staff)
  @JoinColumn( { name: 'doctor_id'})
  doctor: Staff;

  @ManyToOne(() => Prescription, { nullable: true })
  @JoinColumn( { name: 'prescription_id'})
  prescription: Prescription;

  @ManyToOne(() => MedicalTicket, { nullable: true })
  @JoinColumn( { name: 'medical_ticket_id'})
  medical_ticket: MedicalTicket;

  @ManyToOne(() => IndicationTicket, { nullable: true })
  @JoinColumn({ name: 'indication_ticket_id' })
  indication_ticket: IndicationTicket;

  @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;

  @OneToMany(() => Payment, (p) => p.bill)
  payments: Payment[];
}
