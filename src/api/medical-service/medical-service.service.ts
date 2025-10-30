import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalService } from '../../shared/entities/medical-service.entity';
import { Room } from '../../shared/entities/room.entity';
import { Repository, Like } from 'typeorm';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';

@Injectable()
export class MedicalServiceService {
  constructor(
    @InjectRepository(MedicalService)
    private readonly medicalServiceRepository: Repository<MedicalService>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(dto: CreateMedicalServiceDto) {
    const room = await this.roomRepository.findOne({ where: { id: dto.room_id } });
    if (!room) throw new NotFoundException('Room not found');
    const service = this.medicalServiceRepository.create({
      service_name: dto.service_name,
      service_type: dto.service_type,
      service_price: dto.service_price,
      room,
    });
    return this.medicalServiceRepository.save(service);
  }

  async update(id: string, dto: UpdateMedicalServiceDto) {
    const service = await this.medicalServiceRepository.findOne({ where: { id }, relations: ['room'] });
    if (!service) throw new NotFoundException('Medical service not found');
    if (dto.room_id) {
      const room = await this.roomRepository.findOne({ where: { id: dto.room_id } });
      if (!room) throw new NotFoundException('Room not found');
      service.room = room;
    }
    Object.assign(service, dto);
    return this.medicalServiceRepository.save(service);
  }

  async delete(id: string) {
    const service = await this.medicalServiceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Medical service not found');
    await this.medicalServiceRepository.remove(service);
    return { message: 'Medical service deleted' };
  }

  async findAll() {
    return this.medicalServiceRepository.find({ relations: ['room'] });
  }

  async findById(id: string) {
    return this.medicalServiceRepository.findOne({ where: { id }, relations: ['room'] });
  }
  
  // Tìm kiếm dịch vụ y tế theo tên
  async searchByName(q: string) {
    return this.medicalServiceRepository.find({
      where: { service_name: Like(`%${q}%`) },
      take: 10,
      relations: ['room'],
    });
  }
}