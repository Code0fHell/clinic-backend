import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Room } from './room.entity';
import { ServiceIndication } from './service-indication.entity';
import { ServiceType } from '../enums/service-type.enum';

@Entity()
export class MedicalService {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  service_name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.EXAMINATION })
  service_type: ServiceType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  service_price: number;

  @ManyToOne(() => Room, (r) => r.services)
  @JoinColumn( { name: 'room_id'})
  room: Room;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  reference_value: number;

  @OneToMany(() => ServiceIndication, (s) => s.medical_service)
  indications: ServiceIndication[];
}
