import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
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
  bill_type: BillType;

  @ManyToOne(() => Patient)
  patient_id: Patient;

  @ManyToOne(() => Staff)
  doctor_id: Staff;

  @ManyToOne(() => Prescription, { nullable: true })
  prescription_id: Prescription;

  @ManyToOne(() => MedicalTicket, { nullable: true })
  medicalTicket_id: MedicalTicket;

  @Column({type: 'date', default: () => 'CURRENT_TIMESTAMP'})
  createdAt: Date;

  @OneToMany(() => Payment, (p) => p.bill)
  payments: Payment[];
}
