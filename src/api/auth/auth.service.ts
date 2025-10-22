import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/shared/enums/user-role.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/shared/entities/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  // Đăng ký người dùng mới
  async register(registerDto: RegisterDto) {
    const existing = await this.userService.findByUsernameOrEmail(
      registerDto.username,
      registerDto.email,
    );
    if (existing)
      throw new ConflictException('Username or email already exists');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.createUser({
      ...registerDto,
      password: hashedPassword,
    });

    if(registerDto.user_role == UserRole.PATIENT) {
      const patient = this.patientRepository.create({
        user,
      });
      await this.patientRepository.save(patient);
    }

    return { message: 'Registration successful', userId: user.id };
  }

  // Đăng nhập và trả về access_token
  async login(loginDto: LoginDto) {
      const user = await this.userService.findByUsername(loginDto.username);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!isMatch) throw new UnauthorizedException('Invalid credentials');

      const payload = {
        sub: user.id,
        username: user.username,
        role: user.user_role,
      };
      const token = this.jwtService.sign(payload);

      return {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.user_role,
        },
      };
  }
}
