import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MedicalService } from '../../shared/entities/medical-service.entity';
import { Room } from '../../shared/entities/room.entity';
import { Repository, Like } from 'typeorm';
import { CreateMedicalServiceDto } from './dto/create-medical-service.dto';
import { UpdateMedicalServiceDto } from './dto/update-medical-service.dto';
import { ServiceType } from '../../shared/enums/service-type.enum';

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
      description: dto.description,
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

  async findAll(page?: number, limit?: number, service_type?: string) {
    const queryBuilder = this.medicalServiceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.room', 'room');

    if (service_type && Object.values(ServiceType).includes(service_type as ServiceType)) {
      queryBuilder.where('service.service_type = :service_type', { service_type });
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return {
      data,
      total,
      page: page || 1,
      limit: limit || total,
      totalPages: limit ? Math.ceil(total / limit) : 1,
    };
  }

  async findHomepageServices(service_type?: string) {
    const queryBuilder = this.medicalServiceRepository.createQueryBuilder('service')
      .leftJoinAndSelect('service.room', 'room')
      .take(3);

    if (service_type && Object.values(ServiceType).includes(service_type as ServiceType)) {
      queryBuilder.where('service.service_type = :service_type', { service_type });
    }

    return queryBuilder.getMany();
  }

  async findById(id: string) {
    return this.medicalServiceRepository.findOne({ where: { id }, relations: ['room'] });
  }
  
  // Tìm kiếm dịch vụ y tế theo tên và loại
  async searchByName(q: string, service_type?: string) {
    const queryBuilder = this.medicalServiceRepository
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.room', 'room')
      .where('service.service_name LIKE :q', { q: `%${q}%` })
      .take(10);

    // Filter theo service_type nếu có
    if (service_type && Object.values(ServiceType).includes(service_type as ServiceType)) {
      queryBuilder.andWhere('service.service_type = :service_type', { service_type });
    }

    return queryBuilder.getMany();
  }
}