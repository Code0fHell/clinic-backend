import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { MedicalTicket } from './medical-ticket.entity';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { ServiceIndication } from './service-indication.entity';

@Entity()
export class IndicationTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => MedicalTicket, (m) => m.indications)
  medical_ticket_id: MedicalTicket;

  @ManyToOne(() => Staff)
  doctor_id: Staff;

  @ManyToOne(() => Patient)
  patient_id: Patient;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_fee: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  indication_date: Date;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @OneToMany(() => ServiceIndication, (s) => s.indication)
  serviceItems: ServiceIndication[];

  @ManyToOne(() => MedicalTicket, (m) => m.indications)
  medicalTicket: MedicalTicket;
}
