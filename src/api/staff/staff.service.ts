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

  // Lấy danh sách nhân viên với phân trang và filter
  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
    role?: UserRole,
    department?: string,
    search?: string,
  ) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.user', 'user')
      .select([
        'staff.id',
        'staff.department',
        'staff.position',
        'staff.license_number',
        'staff.doctor_type',
        'staff.is_available',
        'user.id',
        'user.username',
        'user.email',
        'user.full_name',
        'user.user_role',
        'user.phone',
        'user.avatar',
      ])
      .orderBy('user.full_name', 'ASC');

    // Filter theo role
    if (role) {
      queryBuilder.andWhere('user.user_role = :role', { role });
    }

    // Filter theo department
    if (department) {
      queryBuilder.andWhere('staff.department LIKE :department', {
        department: `%${department}%`,
      });
    }

    // Search theo tên hoặc email
    if (search) {
      queryBuilder.andWhere(
        '(user.full_name LIKE :search OR user.email LIKE :search OR user.username LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

  // Cập nhật thông tin nhân viên
  async updateStaff(id: string, updateData: any) {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!staff) {
      throw new NotFoundException('Không tìm thấy nhân viên!');
    }

    // Tách dữ liệu user và staff từ DTO
    const { full_name, email, phone, ...staffData } = updateData;

    // Cập nhật thông tin user nếu có
    if (full_name !== undefined || email !== undefined || phone !== undefined) {
      // Kiểm tra email trùng (nếu thay đổi)
      if (email && email !== staff.user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email },
        });

        if (existingUser && existingUser.id !== staff.user.id) {
          throw new ForbiddenException('Email đã tồn tại!');
        }
      }

      // Cập nhật user
      if (full_name !== undefined) staff.user.full_name = full_name;
      if (email !== undefined) staff.user.email = email;
      if (phone !== undefined) staff.user.phone = phone;
      
      await this.userRepository.save(staff.user);
    }

    // Cập nhật thông tin staff
    Object.keys(staffData).forEach((key) => {
      if (staffData[key] !== undefined && staffData[key] !== null && staffData[key] !== '') {
        staff[key] = staffData[key];
      }
    });
    
    return this.staffRepository.save(staff);
  }

  // Xóa nhân viên theo ID
  async deleteStaff(id: string) {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['user'] });
    if (!staff) throw new NotFoundException('Không tìm thấy nhân viên');

    try {
      // Thử xóa staff và user
      await this.staffRepository.remove(staff);
      if (staff.user) await this.userRepository.remove(staff.user);
      return { message: 'Xóa nhân viên thành công!' };
    } catch (error) {
      // Nếu có ràng buộc foreign key, đánh dấu is_available = false
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.message.includes('foreign key constraint')) {
        staff.is_available = false;
        await this.staffRepository.save(staff);
        throw new ForbiddenException(
          'Không thể xóa nhân viên này vì đã có dữ liệu liên quan. Nhân viên đã được đánh dấu là không hoạt động.'
        );
      }
      throw error;
    }
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