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
  workDate: Date;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  details: string;

  @OneToMany(() => WorkScheduleDetail, d => d.schedule)
  detailsList: WorkScheduleDetail[];
}
