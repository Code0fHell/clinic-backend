// src/shared/entities/staff.entity.ts
import {
  Entity, PrimaryColumn, Column, ManyToOne, OneToOne, OneToMany, JoinColumn, Index
} from 'typeorm';
import { User } from './user.entity';
import { WorkSchedule } from './work-schedule.entity';
import { Appointment } from './appointment.entity';
import { IndicationTicket } from './indication-ticket.entity';
import { Bill } from './bill.entity';

@Entity({ name: 'staff' })
@Index(['department'])
export class Staff {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36, nullable: true })
  user_id?: string;

  @OneToOne(() => User, (u) => u.staff)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ length: 150, nullable: true })
  department?: string;

  @Column({ length: 100, nullable: true })
  license_number?: string;

  @Column({ type: 'date', nullable: true })
  hire_date?: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  salary?: number;

  @Column({ default: true })
  is_available: boolean;

  @Column({ length: 100, nullable: true })
  position?: string;

  @OneToMany(() => WorkSchedule, (w) => w.staff)
  workSchedules: WorkSchedule[];

  @OneToMany(() => Appointment, (a) => a.doctor)
  appointments: Appointment[];

  @OneToMany(() => IndicationTicket, (i) => i.doctor)
  indications: IndicationTicket[];

  @OneToMany(() => Bill, (b) => b.doctor)
  bills: Bill[];
}
