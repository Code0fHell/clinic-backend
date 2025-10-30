import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';
import { Medicine } from './medicine.entity';

@Entity()
export class PrescriptionDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescription, (p) => p.details)
  @JoinColumn( { name: 'prescription_id'})
  prescription: Prescription;

  @ManyToOne(() => Medicine, (m) => m.details)
  @JoinColumn( { name: 'medicine_id'})
  medicine: Medicine;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  dosage: string;
}
