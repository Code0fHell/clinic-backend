// src/shared/entities/indication-ticket.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany, Index
} from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { Room } from './room.entity';
import { LabOrder } from './lab-order.entity';
import { ImagingOrder } from './imaging-order.entity';
import { Bill } from './bill.entity';

@Entity({ name: 'indication_ticket' })
@Index(['doctor_id'])
@Index(['patient_id'])
export class IndicationTicket {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36, nullable: true })
  doctor_id?: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'doctor_id' })
  doctor?: Staff;

  @Column({ type: 'char', length: 36 })
  patient_id: string;

  @ManyToOne(() => Patient, (p) => p.indicationTickets)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ type: 'char', length: 36, nullable: true })
  room_id?: string;

  @ManyToOne(() => Room, (r) => r.indications)
  @JoinColumn({ name: 'room_id' })
  room?: Room;

  @Column({ length: 500, nullable: true })
  service_indication?: string;

  @Column({ length: 500, nullable: true })
  diagnostic?: string;

  @Column({ type: 'int', nullable: true })
  quantity?: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  total_fee?: number;

  @Column({ length: 100, nullable: true })
  ordinal_indication_number?: string;

  @Column({ length: 200, nullable: true })
  barcode?: string;

  @Column({ type: 'datetime', nullable: true })
  indication_date?: Date;

  @OneToMany(() => LabOrder, (l) => l.indicationTicket)
  labOrders: LabOrder[];

  @OneToMany(() => ImagingOrder, (i) => i.indicationTicket)
  imagingOrders: ImagingOrder[];

  @OneToMany(() => Bill, (b) => b.indicationTicket)
  bills: Bill[];
}
