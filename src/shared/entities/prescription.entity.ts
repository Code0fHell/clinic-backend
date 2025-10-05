// src/shared/entities/prescription.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { MedicalRecord } from './medical-record.entity';
import { PrescriptionDetail } from './prescription-detail.entity';
import { Bill } from './bill.entity';

@Entity({ name: 'prescription' })
export class Prescription {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  doctor_id: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Staff;

  @Column({ type: 'char', length: 36 })
  patient_id: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'char', length: 36, nullable: true })
  medical_record_id?: string;

  @ManyToOne(() => MedicalRecord, (r) => r.prescriptions)
  @JoinColumn({ name: 'medical_record_id' })
  medicalRecord?: MedicalRecord;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => PrescriptionDetail, (d) => d.prescription)
  details: PrescriptionDetail[];

  @OneToMany(() => Bill, (b) => b.prescription)
  bills: Bill[];
}
