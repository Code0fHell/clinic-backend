import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Room } from './room.entity';
import { ServiceIndication } from './service-indication.entity';

export enum ServiceType {
  EXAMINATION = 'EXAMINATION',
  TEST = 'TEST',
  IMAGING = 'IMAGING',
  OTHER = 'OTHER',
}

@Entity()
export class MedicalService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  serviceName: string;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.EXAMINATION })
  serviceType: ServiceType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  servicePrice: number;

  @ManyToOne(() => Room, (r) => r.services)
  room: Room;

  @OneToMany(() => ServiceIndication, (s) => s.service)
  indications: ServiceIndication[];
}
