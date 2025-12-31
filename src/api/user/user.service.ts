import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../shared/entities/user.entity';
import { Patient } from '../../shared/entities/patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientAccountDto } from './dto/create-patient-account.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../shared/enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async findByUsername(username: string) {
    return this.userRepository.findOne({ 
      where: { username },
      relations: ["patient", "staff"],
    });
  }

  async getProfile(userId: string) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ["patient", "staff"],
    });
  }

  async findByUsernameOrEmail(username: string, email: string) {
    return this.userRepository.findOne({ where: [{ username }, { email }] });
  }

  async createUser(data: Partial<User>) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async updateProfile(id: string, dto: Partial<User>) {
    await this.userRepository.update(id, dto);
    return this.findById(id);
  }

  async findById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  // Tạo tài khoản bệnh nhân mới (user + patient record) - dành cho admin
  async createPatientAccount(dto: CreatePatientAccountDto) {
    // Kiểm tra username hoặc email đã tồn tại
    const existingUser = await this.findByUsernameOrEmail(dto.username, dto.email);
    if (existingUser) {
      throw new ConflictException('Tên đăng nhập hoặc email đã tồn tại!');
    }

    // Kiểm tra số điện thoại đã tồn tại trong patient
    const existingPatient = await this.patientRepository.findOne({
      where: [
        { patient_phone: dto.phone },
        { fatherORmother_phone: dto.phone },
      ],
    });
    if (existingPatient) {
      throw new ConflictException('Số điện thoại đã được sử dụng cho bệnh nhân khác!');
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Tạo user mới với role PATIENT
    const user = await this.createUser({
      username: dto.username,
      password: hashedPassword,
      email: dto.email,
      full_name: dto.full_name,
      user_role: UserRole.PATIENT,
      date_of_birth: dto.date_of_birth,
      gender: dto.gender,
      phone: dto.phone,
      address: dto.address,
    });

    // Tạo patient record
    const patient = this.patientRepository.create({
      user,
      patient_full_name: dto.full_name,
      patient_phone: dto.phone,
      patient_address: dto.address,
      patient_dob: dto.date_of_birth,
      patient_gender: dto.gender,
    });
    await this.patientRepository.save(patient);

    return {
      message: 'Tạo tài khoản bệnh nhân thành công!',
      userId: user.id,
      patientId: patient.id,
      username: user.username,
      full_name: user.full_name,
    };
  }

  // Lấy danh sách tất cả user với phân trang
  async getAllUsers(page: number = 1, limit: number = 10, role?: UserRole) {
    const skip = (page - 1) * limit;
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.staff', 'staff')
      .leftJoinAndSelect('user.patient', 'patient')
      .select([
        'user.id',
        'user.username',
        'user.email',
        'user.full_name',
        'user.user_role',
        'user.phone',
        'user.avatar',
        'user.created_at',
        'staff.id',
        'staff.department',
        'staff.position',
        'patient.id',
      ])
      .orderBy('user.created_at', 'DESC');

    if (role) {
      queryBuilder.andWhere('user.user_role = :role', { role });
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

  // Xóa user (và cascade sang staff/patient nếu có)
  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['staff', 'patient'],
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng!');
    }

    // Không cho phép xóa user có role ADMIN hoặc OWNER
    if (user.user_role === UserRole.ADMIN || user.user_role === UserRole.OWNER) {
      throw new ConflictException('Không thể xóa tài khoản ADMIN hoặc OWNER!');
    }

    await this.userRepository.remove(user);

    return {
      message: 'Xóa tài khoản thành công!',
      userId: id,
    };
  }
}
