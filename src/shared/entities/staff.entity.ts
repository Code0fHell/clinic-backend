import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { WorkSchedule } from './work-schedule.entity';
import { DoctorType } from '../enums/doctor-type.enum';
import { MedicalRecord } from './medical-record.entity';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.staff, { cascade: true })
  @JoinColumn({ name: 'user_id'})
  user: User;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  license_number: string;

  @Column({ type: 'enum', enum: DoctorType, nullable: true })
  doctor_type: DoctorType;

  @Column({ default: true })
  is_available: boolean;

  @OneToMany(() => WorkSchedule, ws => ws.staff)
  schedules: WorkSchedule[];

  @OneToMany(() => MedicalRecord, (mr) => mr.doctor)
  medicalRecords: MedicalRecord[];
}
