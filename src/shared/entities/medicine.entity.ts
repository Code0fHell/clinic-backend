import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PrescriptionDetail } from './prescription-detail.entity';

@Entity()
export class Medicine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @OneToMany(() => PrescriptionDetail, (d) => d.medicine)
  details: PrescriptionDetail[];
}
