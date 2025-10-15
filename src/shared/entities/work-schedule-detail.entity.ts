import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, } from 'typeorm';

import { WorkSchedule } from './work-schedule.entity';

@Entity()
export class WorkScheduleDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkSchedule, ws => ws.details)
  @JoinColumn( {name: 'schedule_id'})
  schedule: WorkSchedule;

  @Column({ type: 'datetime' })
  slot_start: Date;

  @Column({ type: 'datetime' })
  slot_end: Date;

  @Column({ default: false })
  is_booked: boolean;
}
