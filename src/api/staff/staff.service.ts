import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from '../../shared/entities/staff.entity';
import { User } from '../../shared/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStaffDto } from './dto/create-staff.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../shared/enums/user-role.enum';
import { DoctorType } from 'src/shared/enums/doctor-type.enum';
import { WorkSchedule } from 'src/shared/entities/work-schedule.entity';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkSchedule)
    private readonly workScheduleRepository: Repository<WorkSchedule>
  ) { }

  // Lấy ra tất cả nhân viên của phòng khám
  async findAll() {
    return this.staffRepository.find({ relations: ['user'] });
  }

  // Lấy ra nhân viên theo ID
  async findById(id: string) {
    return this.staffRepository.findOne({ where: { id }, relations: ['user'] });
  }

  // Thêm mới nhân viên
  async createStaff(dto: CreateStaffDto) {
    // Only allow valid roles
    if (![UserRole.RECEPTIONIST, UserRole.PHARMACIST, UserRole.DOCTOR].includes(dto.user_role)) {
      throw new ForbiddenException('Invalid staff role');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      username: dto.username,
      password: hashedPassword,
      email: dto.email,
      full_name: dto.full_name,
      user_role: dto.user_role,
    });
    await this.userRepository.save(user);

    const staff = this.staffRepository.create({
      user,
      department: dto.department,
      position: dto.position,
      license_number: dto.license_number,
      doctor_type: dto.doctor_type,
    });
    return this.staffRepository.save(staff);
  }

  // Xóa nhân viên theo ID
  async deleteStaff(id: string) {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['user'] });
    if (!staff) throw new NotFoundException('Staff not found');
    await this.staffRepository.remove(staff);
    if (staff.user) await this.userRepository.remove(staff.user);
    return { message: 'Staff deleted' };
  }

  // Phân quyền bác sĩ
  async authorizeDoctor(id: string, doctorType: DoctorType) {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['user'] });
    if (!staff || staff.user.user_role !== UserRole.DOCTOR) {
      throw new NotFoundException('Doctor not found');
    }
    staff.doctor_type = doctorType;
    staff.is_available = true;
    await this.staffRepository.save(staff);
    return { message: 'Set the type of doctor successfully!', staffId: staff.id, doctorType };
  }

  // Tìm bác sĩ theo loại
  async findDoctorsByType(type: DoctorType) {
    return this.staffRepository.find({
      where: { doctor_type: type, is_available: true },
      relations: ['user'],
    })
  }

  //Lấy lịch làm việc của bác sĩ
  async getWorkSchedules(doctorId: string) {
    return this.workScheduleRepository.find({
      where: { staff: { id: doctorId } },
      relations: ['details'],
      order: { work_date: 'ASC' },
    });
  }

  // Lấy danh sách bác sĩ cho trang chủ (tối đa 3)
  async findHomepageDoctors() {
    return this.staffRepository.find({
      where: { 
        doctor_type: DoctorType.CLINICAL,
        is_available: true 
      },
      relations: ['user'],
      take: 3,
    });
  }
}