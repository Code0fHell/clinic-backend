import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne, OneToMany, Index
} from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { Payment } from './payment.entity';
import { FormTemplate } from './form-template.entity';

export enum Gender {
  NAM = 'NAM',
  NU = 'NU',
  KHAC = 'KHAC'
}

export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR_CLINICAL = 'DOCTOR_CLINICAL',
  DOCTOR_DIAGNOSTIC = 'DOCTOR_DIAGNOSTIC',
  DOCTOR_LAB = 'DOCTOR_LAB',
  PHARMACIST = 'PHARMACIST',
  RECEPTIONIST = 'RECEPTIONIST',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN'
}

@Entity({ name: 'users' })
@Index(['username'], { unique: true })
@Index(['user_role'])
export class User {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 100 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 200, nullable: true })
  email?: string;

  @Column({ length: 200, nullable: true })
  fullName?: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth?: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;

  @Column({ length: 500, nullable: true })
  avatar_url?: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  user_role: UserRole;

  @OneToOne(() => Staff, (staff) => staff.user)
  staff?: Staff;

  @OneToOne(() => Patient, (p) => p.user)
  patient?: Patient;

  @OneToMany(() => Payment, (p) => p.paid_by_user)
  payments: Payment[];

  @OneToMany(() => FormTemplate, (t) => t.owner)
  templates: FormTemplate[];
}
