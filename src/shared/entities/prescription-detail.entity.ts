import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Prescription } from './prescription.entity';
import { Medicine } from './medicine.entity';

@Entity()
export class PrescriptionDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescription, (p) => p.details)
  prescription: Prescription;

  @ManyToOne(() => Medicine, (m) => m.details)
  medicine: Medicine;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  dosage: string;
}
