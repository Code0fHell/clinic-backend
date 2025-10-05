// src/shared/entities/work-schedule-detail.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Index
} from 'typeorm';
import { WorkSchedule } from './work-schedule.entity';
import { Appointment } from './appointment.entity';

@Entity({ name: 'work_schedule_detail' })
@Index(['work_schedule_id'])
export class WorkScheduleDetail {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  work_schedule_id: string;

  @ManyToOne(() => WorkSchedule, (ws) => ws.details)
  @JoinColumn({ name: 'work_schedule_id' })
  workSchedule: WorkSchedule;

  @Column({ type: 'time' })
  slot_start: string;

  @Column({ type: 'time' })
  slot_end: string;

  @Column({ default: false })
  is_booked: boolean;

  @Column({ type: 'char', length: 36, nullable: true })
  appointment_id?: string;

  @ManyToOne(() => Appointment, (a) => a.slot)
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment;
}
