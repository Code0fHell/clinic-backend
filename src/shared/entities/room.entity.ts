import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MedicalService } from './medical-service.entity';
import { RoomType } from '../enums/room-type.enum';

@Entity()
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'char'})
  room_name: string;

  @Column({ type: 'enum', enum: RoomType })
  room_type: RoomType;

  @Column({ type: 'int', nullable: true })
  floor: number;

  @OneToMany(() => MedicalService, (s) => s.room)
  services: MedicalService[];
}
