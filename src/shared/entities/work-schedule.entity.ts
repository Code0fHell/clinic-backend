import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Staff } from './staff.entity';
import { WorkScheduleDetail } from './work-schedule-detail.entity';

@Entity()
export class WorkSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Staff, staff => staff.schedules)
  staff: Staff;

  @Column({ type: 'date' })
  work_date: Date;

  @Column({ type: 'datetime', nullable: true })
  start_time: Date;

  @Column({ type: 'datetime', nullable: true })
  end_time: Date;

  @OneToMany(() => WorkScheduleDetail, d => d.schedule)
  details: WorkScheduleDetail[];
}
