import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { Session } from '../enums/session.enum';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { WorkScheduleDetail } from './work-schedule-detail.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Staff)
  doctor: Staff;

  @ManyToOne(() => Patient)
  patient: Patient;

  @ManyToOne(() => WorkScheduleDetail)
  schedule_detail_id: WorkScheduleDetail;

  @Column({ type: 'datetime' })
  appointment_date: Date;

  @Column({ type: 'enum', enum: Session })
  session: Session;

  @Column({ type: 'enum', enum: AppointmentStatus })
  status: AppointmentStatus;
}
