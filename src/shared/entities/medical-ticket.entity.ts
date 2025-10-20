import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Visit } from './visit.entity';
import { Staff } from './staff.entity';
import { IndicationTicket } from './indication-ticket.entity';

@Entity()
export class MedicalTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Visit)
  @JoinColumn({ name: 'visit_id' })
  visit_id: Visit;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'assigned_doctor_id' })
  assigned_doctor_id: Staff;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  issued_at: Date;

  // @ManyToOne(() => Staff)
  // @JoinColumn({ name: 'created_by' })
  // created_by: Staff;

  @OneToMany(() => IndicationTicket, (i) => i.medical_ticket)
  indications: IndicationTicket[];
}
