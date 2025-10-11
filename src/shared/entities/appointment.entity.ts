import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { Session } from '../enums/session.enum';
import { AppointmentStatus } from '../enums/appointment-status.enum';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Staff)
  doctor: Staff;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column({ type: 'datetime' })
  appointmentDate: Date;

  @Column({ type: 'enum', enum: Session })
  session: Session;

  @Column({ type: 'enum', enum: AppointmentStatus })
  status: AppointmentStatus;
}
