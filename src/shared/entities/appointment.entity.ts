import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
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
  @JoinColumn( { name: 'doctor_id'})
  doctor: Staff;

  @ManyToOne(() => Patient)
  @JoinColumn( { name: 'patient_id'})
  patient: Patient;

  @ManyToOne(() => WorkScheduleDetail)
  @JoinColumn( { name: 'schedule_detail_id'})
  schedule_detail: WorkScheduleDetail;

  @Column({ type: 'datetime' })
  appointment_date: Date;

  @Column( {type: 'varchar', length: 500, nullable: false})
  reason: string;

  @Column({ type: 'enum', enum: Session })
  session: Session;

  @Column({ type: 'enum', enum: AppointmentStatus })
  status: AppointmentStatus;
}
