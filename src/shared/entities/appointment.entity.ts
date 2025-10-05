// src/shared/entities/appointment.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToOne, Index
} from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { WorkScheduleDetail } from './work-schedule-detail.entity';
import { Visit } from './visit.entity';

export enum AppointmentStatus {
  CANCELLED = 'CANCELLED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
}

@Entity({ name: 'appointment' })
@Index(['doctor_id'])
@Index(['patient_id'])
export class Appointment {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36, nullable: true })
  doctor_id?: string;

  @ManyToOne(() => Staff, (s) => s.appointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Staff;

  @Column({ type: 'char', length: 36, nullable: true })
  patient_id?: string;

  @ManyToOne(() => Patient, (p) => p.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @Column({ type: 'enum', enum: ['MORNING', 'AFTERNOON'], nullable: true })
  session?: 'MORNING' | 'AFTERNOON';

  @Column({ type: 'datetime', nullable: true })
  appointment_date?: Date;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.CHECKED_IN })
  status: AppointmentStatus;

  @Column({ type: 'char', length: 36, nullable: true })
  work_schedule_detail_id?: string;

  @OneToOne(() => WorkScheduleDetail, (d) => d.appointment)
  @JoinColumn({ name: 'work_schedule_detail_id' })
  slot?: WorkScheduleDetail;

  @OneToOne(() => Visit, (v) => v.appointment)
  visit?: Visit;
}
