// src/shared/entities/prescription-detail.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn
} from 'typeorm';
import { Prescription } from './prescription.entity';
import { Medicine } from './medicine.entity';

@Entity({ name: 'prescription_detail' })
export class PrescriptionDetail {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  prescription_id: string;

  @ManyToOne(() => Prescription, (p) => p.details)
  @JoinColumn({ name: 'prescription_id' })
  prescription: Prescription;

  @Column({ type: 'char', length: 36 })
  medicine_id: string;

  @ManyToOne(() => Medicine)
  @JoinColumn({ name: 'medicine_id' })
  medicine: Medicine;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ length: 200, nullable: true })
  dosage?: string;

  @Column({ length: 200, nullable: true })
  usage_instruction?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_price?: number;
}
