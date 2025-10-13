import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from '../../shared/entities/staff.entity';
import { User } from '../../shared/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStaffDto } from './dto/create-staff.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../shared/enums/user-role.enum';
import { DoctorType } from 'src/shared/enums/doctor-type.enum';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.staffRepository.find({ relations: ['user'] });
  }

  async findById(id: string) {
    return this.staffRepository.findOne({ where: { id }, relations: ['user'] });
  }

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

  async deleteStaff(id: string) {
    const staff = await this.staffRepository.findOne({ where: { id }, relations: ['user'] });
    if (!staff) throw new NotFoundException('Staff not found');
    await this.staffRepository.remove(staff);
    if (staff.user) await this.userRepository.remove(staff.user);
    return { message: 'Staff deleted' };
  }

  // ...existing code...
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
// ...existing code...
}