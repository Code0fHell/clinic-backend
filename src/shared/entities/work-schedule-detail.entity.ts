import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, } from 'typeorm';

import { WorkSchedule } from './work-schedule.entity';

@Entity()
export class WorkScheduleDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkSchedule, ws => ws.detailsList)
  schedule: WorkSchedule;

  @Column({ type: 'datetime' })
  slotStart: Date;

  @Column({ type: 'datetime' })
  slotEnd: Date;

  @Column({ default: false })
  isBooked: boolean;
}
