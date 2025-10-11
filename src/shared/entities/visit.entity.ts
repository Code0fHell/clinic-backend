import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';
import { VisitType } from '../enums/visit-type.enum';
import { VisitStatus } from '../enums/visit-status.enum';
import { MedicalRecord } from './medical-record.entity';

@Entity()
export class Visit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  patient: Patient;

  @ManyToOne(() => Staff)
  doctor: Staff;

  @Column({ type: 'enum', enum: VisitType })
  visitType: VisitType;

  @Column({ nullable: true })
  queueNumber: number;

  @Column({ type: 'enum', enum: VisitStatus })
  visitStatus: VisitStatus;

  @Column({ type: 'datetime', nullable: true })
  checkedInAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @ManyToOne(() => MedicalRecord, (mr) => mr.visits, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  medicalRecord?: MedicalRecord | null;
}
