// src/shared/entities/imaging-order.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToOne
} from 'typeorm';
import { IndicationTicket } from './indication-ticket.entity';
import { ImageResult } from './image-result.entity';

@Entity({ name: 'imaging_order' })
export class ImagingOrder {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36 })
  indication_ticket_id: string;

  @ManyToOne(() => IndicationTicket, (i) => i.imagingOrders)
  @JoinColumn({ name: 'indication_ticket_id' })
  indicationTicket: IndicationTicket;

  @Column({ type: 'char', length: 36, nullable: true })
  result_id?: string;

  @OneToOne(() => ImageResult)
  @JoinColumn({ name: 'result_id' })
  result?: ImageResult;
}
