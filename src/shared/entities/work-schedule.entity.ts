// src/shared/entities/work-schedule.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { Staff } from './staff.entity';
import { Room } from './room.entity';
import { WorkScheduleDetail } from './work-schedule-detail.entity';

export enum Session {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
}

export enum ScheduleStatus {
  AVAILABLE = 'AVAILABLE',
  ON_LEAVE = 'ON_LEAVE',
  OCCUPIED = 'OCCUPIED',
}

@Entity({ name: 'work_schedule' })
@Index(['staff_id', 'work_date'])
export class WorkSchedule {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  staff_id: string;

  @ManyToOne(() => Staff, (s) => s.workSchedules)
  @JoinColumn({ name: 'staff_id' })
  staff: Staff;

  @Column({ type: 'char', length: 36, nullable: true })
  room_id?: string;

  @ManyToOne(() => Room, (r) => r.schedules)
  @JoinColumn({ name: 'room_id' })
  room?: Room;

  @Column({ type: 'date' })
  work_date: Date;

  @Column({ type: 'enum', enum: Session })
  session: Session;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'enum', enum: ScheduleStatus, default: ScheduleStatus.AVAILABLE })
  status: ScheduleStatus;

  @Column({ length: 255, nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @OneToMany(() => WorkScheduleDetail, (d) => d.workSchedule)
  details: WorkScheduleDetail[];
}
