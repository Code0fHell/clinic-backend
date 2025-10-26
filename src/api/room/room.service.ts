import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from '../../shared/entities/room.entity';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(dto: CreateRoomDto) {
    const room = this.roomRepository.create(dto);
    return this.roomRepository.save(room);
  }

  async update(id: string, dto: UpdateRoomDto) {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    Object.assign(room, dto);
    return this.roomRepository.save(room);
  }

  async delete(id: string) {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    await this.roomRepository.remove(room);
    return { message: 'Room deleted' };
  }

  async findAll() {
    return this.roomRepository.find();
  }

  async findById(id: string) {
    return this.roomRepository.findOne({ where: { id } });
  }
}