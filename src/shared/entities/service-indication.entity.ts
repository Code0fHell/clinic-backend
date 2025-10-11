import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IndicationTicket } from './indication-ticket.entity';
import { MedicalService } from './medical-service.entity';

@Entity()
export class ServiceIndication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IndicationTicket, (i) => i.serviceItems)
  indication: IndicationTicket;

  @ManyToOne(() => MedicalService, (m) => m.indications)
  service: MedicalService;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
