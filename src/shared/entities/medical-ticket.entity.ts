import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { Visit } from './visit.entity';
import { Staff } from './staff.entity';
import { IndicationTicket } from './indication-ticket.entity';

@Entity()
export class MedicalTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Visit)
  visit: Visit;

  @ManyToOne(() => Staff)
  assignedDoctor: Staff;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @CreateDateColumn()
  issuedAt: Date;

  @OneToMany(() => IndicationTicket, (i) => i.medicalTicket)
  indications: IndicationTicket[];
}
