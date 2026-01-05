import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Visit } from './visit.entity';
import { MedicalRecord } from './medical-record.entity';
import { Gender } from '../enums/gender.enum';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.patient, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @Column()
  patient_full_name: string;

  @Column({ type: 'text' })
  patient_address: string;

  @Column()
  patient_phone: string;

  @Column({ type: 'date' })
  patient_dob: Date;

  @Column({ type: 'enum', enum: Gender })
  patient_gender: Gender;

  @Column({ nullable: true })
  fatherORmother_name: string;

  @Column({ nullable: true })
  fatherORmother_phone: string;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  blood_type: string;

  @Column({ nullable: true })
  respiratory_rate: string;

  @Column({ nullable: true })
  blood_pressure: string;

  @Column({ type: 'int', nullable: true })
  pulse_rate: number;

  @Column({ type: 'text', nullable: true })
  medical_history: string;

  @OneToMany(() => Visit, v => v.patient)
  visits: Visit[];

  @OneToMany(() => MedicalRecord, (mr) => mr.patient)
  medicalRecords: MedicalRecord[];
}
