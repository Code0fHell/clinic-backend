import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Visit } from './visit.entity';
import { Staff } from './staff.entity';
import { IndicationTicket } from './indication-ticket.entity';

@Entity()
export class MedicalTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Visit)
  visit_id: Visit;

  @ManyToOne(() => Staff)
  assigned_doctor_id: Staff;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  issued_at: Date;

  @OneToMany(() => IndicationTicket, (i) => i.medicalTicket)
  indications: IndicationTicket[];
}
