import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkSchedule } from '../../shared/entities/work-schedule.entity';
import { WorkScheduleDetail } from '../../shared/entities/work-schedule-detail.entity';
import { Staff } from '../../shared/entities/staff.entity';
import { Repository, Between } from 'typeorm';
import { AddWorkScheduleDto } from './dto/add-work-schedule.dto';
import { AddWorkScheduleDetailDto } from './dto/add-work-schedule-detail.dto';
import { GetWeeklyScheduleDto } from './dto/get-weekly-schedule.dto';
import { GetStaffWeeklyScheduleDto } from './dto/get-staff-weekly-schedule.dto';
import { CreateWeeklyScheduleDto } from './dto/create-weekly-schedule.dto';
import { UpdateWorkScheduleDto } from './dto/update-work-schedule.dto';

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
    if (!staff) throw new NotFoundException('Staff not found');
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
    if (!schedule) throw new NotFoundException('Work schedule not found');
    const detail = this.workScheduleDetailRepository.create({
      schedule,
      slot_start: dto.slot_start,
      slot_end: dto.slot_end,
      is_booked: false,
    });
    return this.workScheduleDetailRepository.save(detail);
  }

  // Lấy lịch làm việc của tất cả nhân viên trong 1 tuần
  async getWeeklySchedule(dto: GetWeeklyScheduleDto) {
    const queryBuilder = this.workScheduleRepository
      .createQueryBuilder('ws')
      .leftJoinAndSelect('ws.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'user')
      .leftJoinAndSelect('ws.details', 'details')
      .where('ws.work_date BETWEEN :start_date AND :end_date', {
        start_date: dto.start_date,
        end_date: dto.end_date,
      });

    if (dto.department) {
      queryBuilder.andWhere('staff.department = :department', { department: dto.department });
    }

    if (dto.doctor_type) {
      queryBuilder.andWhere('staff.doctor_type = :doctor_type', { doctor_type: dto.doctor_type });
    }

    const schedules = await queryBuilder
      .orderBy('staff.id', 'ASC')
      .addOrderBy('ws.work_date', 'ASC')
      .getMany();

    // Group by staff
    const staffScheduleMap = new Map();
    schedules.forEach(schedule => {
      const staffId = schedule.staff.id;
      if (!staffScheduleMap.has(staffId)) {
        staffScheduleMap.set(staffId, {
          staff: {
            id: schedule.staff.id,
            full_name: schedule.staff.user.full_name,
            department: schedule.staff.department,
            position: schedule.staff.position,
            doctor_type: schedule.staff.doctor_type,
          },
          schedules: [],
        });
      }
      staffScheduleMap.get(staffId).schedules.push({
        id: schedule.id,
        work_date: schedule.work_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        total_slots: schedule.details?.length || 0,
        booked_slots: schedule.details?.filter(d => d.is_booked).length || 0,
      });
    });

    return Array.from(staffScheduleMap.values());
  }

  // Lấy lịch làm việc chi tiết của 1 nhân viên trong 1 tuần
  async getStaffWeeklySchedule(dto: GetStaffWeeklyScheduleDto) {
    const staff = await this.staffRepository.findOne({
      where: { id: dto.staff_id },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    // Sử dụng raw query để so sánh chính xác theo DATE
    const schedules = await this.workScheduleRepository
      .createQueryBuilder('ws')
      .leftJoinAndSelect('ws.details', 'details')
      .leftJoinAndSelect('ws.staff', 'staff')
      .where('staff.id = :staff_id', { staff_id: dto.staff_id })
      .andWhere('DATE(ws.work_date) >= DATE(:start_date)', { start_date: dto.start_date })
      .andWhere('DATE(ws.work_date) <= DATE(:end_date)', { end_date: dto.end_date })
      .orderBy('ws.work_date', 'ASC')
      .addOrderBy('details.slot_start', 'ASC')
      .getMany();

    return {
      staff: {
        id: staff.id,
        full_name: staff.user.full_name,
        department: staff.department,
        position: staff.position,
        doctor_type: staff.doctor_type,
      },
      schedules: schedules.map(schedule => ({
        id: schedule.id,
        work_date: schedule.work_date,
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        slots: schedule.details?.map(detail => ({
          id: detail.id,
          slot_start: detail.slot_start,
          slot_end: detail.slot_end,
          is_booked: detail.is_booked,
        })) || [],
      })),
    };
  }

  // Tạo lịch làm việc cho cả tuần với các slots tự động
  async createWeeklySchedule(dto: CreateWeeklyScheduleDto) {
    const staff = await this.staffRepository.findOne({ where: { id: dto.staff_id } });
    if (!staff) {
      throw new NotFoundException('Staff not found');
    }

    // Check for existing schedules on the same dates
    const existingSchedules = await this.workScheduleRepository.find({
      where: {
        staff: { id: dto.staff_id },
      },
      relations: ['staff'],
    });

    const existingDates = existingSchedules.map(s => {
      const date = new Date(s.work_date);
      return date.toISOString().split('T')[0];
    });

    const duplicateDates = dto.working_dates.filter(date => existingDates.includes(date));
    
    if (duplicateDates.length > 0) {
      throw new BadRequestException(
        `Lịch làm việc đã tồn tại cho các ngày: ${duplicateDates.join(', ')}. Vui lòng xóa lịch cũ hoặc chọn ngày khác.`
      );
    }

    const createdSchedules: any[] = [];

    for (const dateStr of dto.working_dates) {
      const workDate = new Date(dateStr);
      
      // Tạo start_time và end_time với date + time
      const startDateTime = new Date(`${dateStr}T${dto.start_time}:00`);
      const endDateTime = new Date(`${dateStr}T${dto.end_time}:00`);

      // Tạo work schedule
      const schedule = this.workScheduleRepository.create({
        staff,
        work_date: workDate,
        start_time: startDateTime,
        end_time: endDateTime,
      });
      const savedSchedule = await this.workScheduleRepository.save(schedule);

      // Tạo các slots
      const slots: WorkScheduleDetail[] = [];
      let currentSlotStart = new Date(startDateTime);
      
      while (currentSlotStart < endDateTime) {
        const currentSlotEnd = new Date(currentSlotStart.getTime() + dto.slot_duration * 60000);
        
        if (currentSlotEnd > endDateTime) break;

        const detail = this.workScheduleDetailRepository.create({
          schedule: savedSchedule,
          slot_start: currentSlotStart,
          slot_end: currentSlotEnd,
          is_booked: false,
        });
        slots.push(detail);

        currentSlotStart = new Date(currentSlotEnd);
      }

      await this.workScheduleDetailRepository.save(slots);
      
      createdSchedules.push({
        ...savedSchedule,
        details: slots,
      });
    }

    return {
      message: 'Weekly schedule created successfully',
      schedules: createdSchedules,
    };
  }

  // Cập nhật work schedule
  async updateWorkSchedule(id: string, dto: UpdateWorkScheduleDto) {
    const schedule = await this.workScheduleRepository.findOne({ 
      where: { id },
      relations: ['details']
    });
    
    if (!schedule) {
      throw new NotFoundException('Work schedule not found');
    }

    // Kiểm tra xem có slot nào đã được đặt không
    const hasBookedSlots = schedule.details?.some(detail => detail.is_booked);
    if (hasBookedSlots) {
      throw new BadRequestException('Cannot update schedule with booked slots');
    }

    if (dto.start_time) schedule.start_time = dto.start_time;
    if (dto.end_time) schedule.end_time = dto.end_time;

    return this.workScheduleRepository.save(schedule);
  }

  // Xóa work schedule
  async deleteWorkSchedule(id: string) {
    const schedule = await this.workScheduleRepository.findOne({ 
      where: { id },
      relations: ['details']
    });
    
    if (!schedule) {
      throw new NotFoundException('Work schedule not found');
    }

    // Kiểm tra xem có slot nào đã được đặt không
    const hasBookedSlots = schedule.details?.some(detail => detail.is_booked);
    if (hasBookedSlots) {
      throw new BadRequestException('Cannot delete schedule with booked slots');
    }

    await this.workScheduleRepository.remove(schedule);
    return { message: 'Work schedule deleted successfully' };
  }

  // Sao chép lịch từ tuần trước
  async copyFromPreviousWeek(staffId: string, targetWeekStart: string) {
    // Tính ngày bắt đầu tuần trước
    const targetDate = new Date(targetWeekStart);
    const previousWeekStart = new Date(targetDate);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    
    const previousWeekEnd = new Date(previousWeekStart);
    previousWeekEnd.setDate(previousWeekEnd.getDate() + 6);

    // Lấy lịch tuần trước
    const previousSchedules = await this.workScheduleRepository.find({
      where: {
        staff: { id: staffId },
        work_date: Between(previousWeekStart, previousWeekEnd),
      },
      relations: ['details', 'staff'],
      order: { work_date: 'ASC' },
    });

    if (previousSchedules.length === 0) {
      throw new NotFoundException('No schedule found in previous week');
    }

    const createdSchedules: WorkSchedule[] = [];

    for (const oldSchedule of previousSchedules) {
      // Tính ngày mới (cộng thêm 7 ngày)
      const newDate = new Date(oldSchedule.work_date);
      newDate.setDate(newDate.getDate() + 7);
      
      const newStartTime = new Date(oldSchedule.start_time);
      newStartTime.setDate(newStartTime.getDate() + 7);
      
      const newEndTime = new Date(oldSchedule.end_time);
      newEndTime.setDate(newEndTime.getDate() + 7);

      // Tạo schedule mới
      const newSchedule = this.workScheduleRepository.create({
        staff: oldSchedule.staff,
        work_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
      });
      const savedSchedule = await this.workScheduleRepository.save(newSchedule);

      // Sao chép các slots
      const newSlots = oldSchedule.details.map(oldDetail => {
        const newSlotStart = new Date(oldDetail.slot_start);
        newSlotStart.setDate(newSlotStart.getDate() + 7);
        
        const newSlotEnd = new Date(oldDetail.slot_end);
        newSlotEnd.setDate(newSlotEnd.getDate() + 7);

        return this.workScheduleDetailRepository.create({
          schedule: savedSchedule,
          slot_start: newSlotStart,
          slot_end: newSlotEnd,
          is_booked: false,
        });
      });

      await this.workScheduleDetailRepository.save(newSlots);
      createdSchedules.push(savedSchedule);
    }

    return {
      message: 'Schedule copied from previous week successfully',
      schedules: createdSchedules,
    };
  }
}