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
  medicalTicket: MedicalTicket;

  @ManyToOne(() => Staff)
  doctor: Staff;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalFee: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  indicationDate: Date;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @OneToMany(() => ServiceIndication, (s) => s.indication)
  serviceItems: ServiceIndication[];
}
