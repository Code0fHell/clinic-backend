// src/shared/entities/image-result.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, CreateDateColumn
} from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';

@Entity({ name: 'image_result' })
export class ImageResult {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 200, nullable: true })
  barcode?: string;

  @Column({ length: 1000, nullable: true })
  image_url?: string;

  @Column({ type: 'char', length: 36, nullable: true })
  doctor_id?: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Staff;

  @Column({ type: 'char', length: 36, nullable: true })
  patient_id?: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient?: Patient;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
