// src/shared/entities/patient.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { Visit } from './visit.entity';
import { IndicationTicket } from './indication-ticket.entity';
import { Bill } from './bill.entity';
import { MedicalRecord } from './medical-record.entity';

@Entity({ name: 'patient' })
export class Patient {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36, nullable: true })
  user_id?: string;

  @ManyToOne(() => User, (u) => u.patient)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ length: 100, nullable: true })
  nationality?: string;

  @OneToMany(() => Appointment, (a) => a.patient)
  appointments: Appointment[];

  @OneToMany(() => Visit, (v) => v.patient)
  visits: Visit[];

  @OneToMany(() => IndicationTicket, (i) => i.patient)
  indicationTickets: IndicationTicket[];

  @OneToMany(() => Bill, (b) => b.patient)
  bills: Bill[];

  @OneToMany(() => MedicalRecord, (m) => m.patient)
  medicalRecords: MedicalRecord[];
}
