// src/shared/entities/room.entity.ts
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { WorkSchedule } from './work-schedule.entity';
import { MedicalTicket } from './medical-ticket.entity';
import { IndicationTicket } from './indication-ticket.entity';
import { MedicalService } from './medical-service.entity';

export enum RoomType {
  LAB = 'LAB',
  DIAGNOSTIC = 'DIAGNOSTIC',
  CLINICAL = 'CLINICAL',
}

@Entity({ name: 'room' })
export class Room {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'enum', enum: RoomType, default: RoomType.CLINICAL })
  room_type: RoomType;

  @Column({ type: 'int', nullable: true })
  floor?: number;

  @Column({ length: 150 })
  room_name: string;

  @OneToMany(() => WorkSchedule, (w) => w.room)
  schedules: WorkSchedule[];

  @OneToMany(() => MedicalTicket, (m) => m.room)
  tickets: MedicalTicket[];

  @OneToMany(() => IndicationTicket, (i) => i.room)
  indications: IndicationTicket[];

  @OneToMany(() => MedicalService, (s) => s.room)
  services: MedicalService[];
}
