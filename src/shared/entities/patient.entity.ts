import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Visit } from './visit.entity';
import { MedicalRecord } from './medical-record.entity';
@Entity()
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, user => user.patient, { cascade: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  father_name: string;

  @Column({ nullable: true })
  mother_name: string;

  @Column({ nullable: true })
  father_phone: string;

  @Column({ nullable: true })
  mother_phone: string;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  blood_type: string;

  @Column({ nullable: true })
  respiratory_rate: string;

  @Column({ type: 'text', nullable: true })
  medical_history: string;

  @OneToMany(() => Visit, v => v.patient)
  visits: Visit[];

  @OneToMany(() => MedicalRecord, (mr) => mr.patient)
  medicalRecords: MedicalRecord[];
}
