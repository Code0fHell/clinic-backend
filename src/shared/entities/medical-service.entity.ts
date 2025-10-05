// src/shared/entities/medical-service.entity.ts
import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Room } from './room.entity';
import { ServiceIndication } from './service-indication.entity';

export enum ServiceType {
  EXAMINATION = 'EXAMINATION', // khám bệnh
  TEST = 'TEST',               // xét nghiệm
  IMAGING = 'IMAGING',         // chẩn đoán hình ảnh
  OTHER = 'OTHER',             // khác
}

@Entity({ name: 'medical_service' })
@Index(['service_type'])
export class MedicalService {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ length: 255 })
  service_name: string;

  @Column({ type: 'enum', enum: ServiceType })
  service_type: ServiceType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  service_price: number;

  @Column({ length: 255, nullable: true })
  unit?: string;

  @Column({ length: 255, nullable: true })
  category?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'char', length: 36, nullable: true })
  room_id?: string;

  @ManyToOne(() => Room, (r) => r.services)
  @JoinColumn({ name: 'room_id' })
  room?: Room;

  @OneToMany(() => ServiceIndication, (si) => si.service)
  indications: ServiceIndication[];

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updated_at: Date;
}
