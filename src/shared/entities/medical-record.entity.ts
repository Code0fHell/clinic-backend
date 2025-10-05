// src/shared/entities/medical-record.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn
} from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Prescription } from './prescription.entity';

@Entity({ name: 'medical_record' })
export class MedicalRecord {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  patient_id: string;

  @ManyToOne(() => Patient, (p) => p.medicalRecords)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'char', length: 36, nullable: true })
  doctor_id?: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Staff;

  @Column({ length: 255, nullable: true })
  diagnosis?: string;

  @Column({ type: 'text', nullable: true })
  symptoms?: string;

  @Column({ type: 'text', nullable: true })
  treatment_plan?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @OneToMany(() => Prescription, (p) => p.medicalRecord)
  prescriptions: Prescription[];
}
