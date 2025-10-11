import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
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
  patient: Patient;

  @ManyToOne(() => Staff)
  doctor: Staff;

  @Column({ type: 'text', nullable: true })
  conclusion: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PrescriptionDetail, (d) => d.prescription)
  details: PrescriptionDetail[];

  @ManyToOne(() => MedicalRecord, (mr) => mr.prescriptions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  medicalRecord?: MedicalRecord | null;
}
