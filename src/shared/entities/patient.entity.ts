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
  fatherName: string;

  @Column({ nullable: true })
  motherName: string;

  @Column({ nullable: true })
  fatherPhone: string;

  @Column({ nullable: true })
  motherPhone: string;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ type: 'float', nullable: true })
  weight: number;

  @Column({ nullable: true })
  bloodType: string;

  @Column({ nullable: true })
  respiratoryRate: string;

  @Column({ type: 'text', nullable: true })
  medicalHistory: string;

  @OneToMany(() => Visit, v => v.patient)
  visits: Visit[];

  @OneToMany(() => MedicalRecord, (mr) => mr.patient)
  medicalRecords: MedicalRecord[];
}
