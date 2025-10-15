import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkSchedule } from '../../shared/entities/work-schedule.entity';
import { WorkScheduleDetail } from '../../shared/entities/work-schedule-detail.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Repository } from 'typeorm';
import { AddWorkScheduleDto } from './dto/add-work-schedule.dto';
import { AddWorkScheduleDetailDto } from './dto/add-work-schedule-detail.dto';

@Injectable()
export class WorkScheduleService {
  constructor(
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepository: Repository<WorkSchedule>,
    @InjectRepository(WorkScheduleDetail)
    private readonly workScheduleDetailRepository: Repository<WorkScheduleDetail>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async addWorkSchedule(dto: AddWorkScheduleDto) {
    const staff = await this.staffRepository.findOne({ where: { id: dto.staff_id } });
    if (!staff) throw new Error('Staff not found');
    const schedule = this.workScheduleRepository.create({
      staff,
      work_date: dto.work_date,
      start_time: dto.start_time,
      end_time: dto.end_time,
    });
    return this.workScheduleRepository.save(schedule);
  }

  async addWorkScheduleDetail(dto: AddWorkScheduleDetailDto) {
    const schedule = await this.workScheduleRepository.findOne({ where: { id: dto.schedule_id } });
    if (!schedule) throw new Error('Work schedule not found');
    const detail = this.workScheduleDetailRepository.create({
      schedule,
      slot_start: dto.slot_start,
      slot_end: dto.slot_end,
      is_booked: false,
    });
    return this.workScheduleDetailRepository.save(detail);
  }
}