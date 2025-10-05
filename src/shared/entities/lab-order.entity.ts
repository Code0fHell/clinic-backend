// src/shared/entities/lab-order.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToOne
} from 'typeorm';
import { IndicationTicket } from './indication-ticket.entity';
import { LabTestResult } from './lab-test-result.entity';

@Entity({ name: 'lab_order' })
export class LabOrder {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  indication_ticket_id: string;

  @ManyToOne(() => IndicationTicket, (i) => i.labOrders)
  @JoinColumn({ name: 'indication_ticket_id' })
  indicationTicket: IndicationTicket;

  @Column({ type: 'char', length: 36, nullable: true })
  result_id?: string;

  @OneToOne(() => LabTestResult)
  @JoinColumn({ name: 'result_id' })
  result?: LabTestResult;
}
