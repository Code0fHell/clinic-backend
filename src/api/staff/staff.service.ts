import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from '../../shared/entities/staff.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async findAll() {
    return this.staffRepository.find({ relations: ['user'] });
  }

  async findById(id: string) {
    return this.staffRepository.findOne({ where: { id }, relations: ['user'] });
  }
}
