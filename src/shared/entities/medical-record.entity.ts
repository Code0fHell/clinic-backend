import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { Visit } from './visit.entity';
import { Prescription } from './prescription.entity';

@Entity({ name: 'medical_record' })
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (p) => p.medicalRecords, { nullable: false, onDelete: 'CASCADE' })
  patient: Patient;

  @ManyToOne(() => Staff, (s) => s.medicalRecords, { nullable: true, onDelete: 'SET NULL' })
  doctor?: Staff | null;

  @Column({ type: 'text', nullable: true })
  history?: string | null;

  @OneToMany(() => Visit, (v) => v.medicalRecord)
  visits: Visit[];

  @OneToMany(() => Prescription, (pres) => pres.medicalRecord)
  prescriptions: Prescription[];

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })  
  updatedAt: Date;
}
