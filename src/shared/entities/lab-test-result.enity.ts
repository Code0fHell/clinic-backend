import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IndicationTicket } from './indication-ticket.entity';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';

@Entity()
export class LabTestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IndicationTicket)
  indication: IndicationTicket;

  @ManyToOne(() => Staff)
  doctor: Staff;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column({ type: 'text', nullable: true })
  result: string;

  @Column({ type: 'text', nullable: true })
  conclusion: string;

  @Column({type: 'date', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;
}
