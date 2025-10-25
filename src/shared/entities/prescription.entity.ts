import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { PrescriptionDetail } from './prescription-detail.entity';
import { MedicalRecord } from './medical-record.entity';

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  @JoinColumn( { name: 'patient_id'})
  patient: Patient;

  @ManyToOne(() => Staff)
  @JoinColumn( { name: 'doctor_id'})
  doctor: Staff;

  @Column({ type: 'text', nullable: true })
  conclusion: string;

  @Column({type: 'date', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;

  @OneToMany(() => PrescriptionDetail, (d) => d.prescription)
  details: PrescriptionDetail[];

  @ManyToOne(() => MedicalRecord, (mr) => mr.prescriptions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn( { name: 'medical_record_id'})
  medical_record?: MedicalRecord | null;
  
  @Column({ type: 'date', nullable: true })
  return_date?: Date | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_fee: number;
}
