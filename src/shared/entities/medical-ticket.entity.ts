// src/shared/entities/medical-ticket.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToOne, Index
} from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Room } from './room.entity';
import { Visit } from './visit.entity';
import { Bill } from './bill.entity';

@Entity({ name: 'medical_ticket' })
@Index(['visit_id'])
export class MedicalTicket {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 200, nullable: true })
  barcode?: string;

  @Column({ length: 100, nullable: true })
  ticket_number?: string;

  @Column({ type: 'char', length: 36, nullable: true })
  patient_id?: string;

  @ManyToOne(() => Patient, (p) => p.medicalRecords)
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @Column({ type: 'char', length: 36, nullable: true })
  receptionist_id?: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'receptionist_id' })
  receptionist?: Staff;

  @Column({ length: 200, nullable: true })
  referral_clinic?: string;

  @Column({ type: 'char', length: 36, nullable: true })
  room_id?: string;

  @ManyToOne(() => Room, (r) => r.tickets)
  @JoinColumn({ name: 'room_id' })
  room?: Room;

  @Column({ type: 'char', length: 36, nullable: true })
  visit_id?: string;

  @OneToOne(() => Visit, (v) => v.medicalTicket)
  @JoinColumn({ name: 'visit_id' })
  visit?: Visit;

  @Column({ type: 'datetime', nullable: true })
  printed_at?: Date;

  @Column({ type: 'char', length: 36, nullable: true })
  assigned_doctor_id?: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'assigned_doctor_id' })
  assignedDoctor?: Staff;

  @OneToOne(() => Bill, (b) => b.medicalTicket)
  bill?: Bill;
}
