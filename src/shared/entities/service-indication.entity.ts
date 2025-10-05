// src/shared/entities/service-indication.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IndicationTicket } from './indication-ticket.entity';
import { MedicalService } from './medical-service.entity';
import { Staff } from './staff.entity';

@Entity({ name: 'service_indication' })
@Index(['indication_ticket_id'])
@Index(['service_id'])
export class ServiceIndication {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  indication_ticket_id: string;

  @ManyToOne(() => IndicationTicket, (it) => it.labOrders)
  @JoinColumn({ name: 'indication_ticket_id' })
  indicationTicket: IndicationTicket;

  @Column({ type: 'char', length: 36 })
  service_id: string;

  @ManyToOne(() => MedicalService, (s) => s.indications)
  @JoinColumn({ name: 'service_id' })
  service: MedicalService;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_price: number;

  @Column({ type: 'char', length: 36, nullable: true })
  performer_id?: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'performer_id' })
  performer?: Staff;

  @Column({ length: 255, nullable: true })
  status?: string; // ví dụ: 'PENDING', 'COMPLETED'

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
