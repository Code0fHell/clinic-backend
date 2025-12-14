import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IndicationTicket } from './indication-ticket.entity';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';

@Entity()
export class LabTestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IndicationTicket)
  @JoinColumn({ name: 'indication_id' })
  indication: IndicationTicket;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Staff;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ type: 'text', nullable: true })
  conclusion: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
