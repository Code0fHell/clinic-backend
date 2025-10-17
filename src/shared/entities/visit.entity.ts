import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { VisitType } from '../enums/visit-type.enum';
import { VisitStatus } from '../enums/visit-status.enum';
import { MedicalRecord } from './medical-record.entity';
import { Appointment } from './appointment.entity';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Staff;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment?: Appointment | null;

  @Column({ type: 'enum', enum: VisitType })
  visit_type: VisitType;

  @Column({ nullable: true })
  queue_number: number;

  @Column({ type: 'enum', enum: VisitStatus })
  visit_status: VisitStatus;

  @Column({ type: 'datetime', nullable: true })
  checked_in_at: Date;

  @Column({ type: 'datetime', nullable: true })
  completed_at: Date;

  @ManyToOne(() => MedicalRecord, (mr) => mr.visits, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord?: MedicalRecord | null;
}
