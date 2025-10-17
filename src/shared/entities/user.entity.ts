import { Entity, PrimaryGeneratedColumn, Column, OneToOne, } from 'typeorm';
import { Staff } from './staff.entity';
import { Patient } from './patient.entity';
import { UserRole } from '../enums/user-role.enum';
import { Gender } from '../enums/gender.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole })
  user_role: UserRole;

  @Column({type: 'date', default: () => 'CURRENT_TIMESTAMP'})
  created_at: Date;

  @Column({type: 'date', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP'})
  updated_at: Date;

  @OneToOne(() => Staff, staff => staff.user)
  staff: Staff;

  @OneToOne(() => Patient, patient => patient.user, { cascade: true })
  patient: Patient;
}
