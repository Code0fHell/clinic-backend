import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IndicationTicket } from './indication-ticket.entity';
import { MedicalService } from './medical-service.entity';

@Entity()
export class ServiceIndication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IndicationTicket, (i) => i.serviceItems)
  @JoinColumn( {name: 'indication_id'})
  indication: IndicationTicket;

  @ManyToOne(() => MedicalService, (m) => m.indications)
  @JoinColumn( {name: 'medical_service_id'})
  medical_service: MedicalService;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'int', nullable: false })
  queue_number: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;
}
