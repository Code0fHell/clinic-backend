// src/shared/entities/visit.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToOne, JoinColumn, Index
} from 'typeorm';
import { Patient } from './patient.entity';
import { Appointment } from './appointment.entity';
import { User } from './user.entity';
import { MedicalTicket } from './medical-ticket.entity';

export enum VisitType {
  WALK_IN = 'WALK_IN',
  APPOINTMENT = 'APPOINTMENT',
}

export enum VisitStatus {
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'visit' })
@Index(['patient_id'])
export class Visit {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  patient_id: string;

  @ManyToOne(() => Patient, (p) => p.visits)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'char', length: 36, nullable: true })
  appointment_id?: string;

  @OneToOne(() => Appointment, (a) => a.visit)
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment;

  @Column({ type: 'enum', enum: VisitType })
  visit_type: VisitType;

  @Column({ type: 'int', nullable: true })
  queue_number?: number;

  @Column({ type: 'char', length: 36, nullable: true })
  created_by?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator?: User;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  checked_in_at?: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at?: Date;

  @Column({ type: 'enum', enum: VisitStatus, default: VisitStatus.CHECKED_IN })
  visit_status: VisitStatus;

  @OneToOne(() => MedicalTicket, (m) => m.visit)
  medicalTicket?: MedicalTicket;
}
