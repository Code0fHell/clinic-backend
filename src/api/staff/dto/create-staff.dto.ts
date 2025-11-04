import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength, MaxLength, IsOptional, IsEnum, Matches, } from 'class-validator';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { DoctorType } from '../../../shared/enums/doctor-type.enum';

export class CreateStaffDto {
  @ApiProperty({
    enum: UserRole,
    example: UserRole.DOCTOR,
    description: 'Vai trò của nhân viên trong hệ thống (RECEPTIONIST, PHARMACIST, DOCTOR, ADMIN)',
  })
  @IsEnum(UserRole, { message: 'Vai trò người dùng không hợp lệ' })
  @IsNotEmpty({ message: 'Vai trò người dùng là bắt buộc' })
  user_role: UserRole;

  @ApiProperty({
    example: 'doctor.nguyen',
    description: 'Tên đăng nhập của nhân viên',
  })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @MinLength(4, { message: 'Tên đăng nhập phải có ít nhất 4 ký tự' })
  @MaxLength(30, { message: 'Tên đăng nhập không được vượt quá 30 ký tự' })
  username: string;

  @ApiProperty({
    example: 'StrongPass@123',
    description: 'Mật khẩu của nhân viên (ít nhất 8 ký tự, có chữ hoa, chữ thường, số và ký tự đặc biệt)',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/, {
    message:
      'Mật khẩu phải bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
  })
  password: string;

  @ApiProperty({
    example: 'doctor.nguyen@example.com',
    description: 'Địa chỉ email của nhân viên',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    example: 'Bác sĩ Nguyễn Văn A',
    required: false,
    description: 'Tên đầy đủ của nhân viên',
  })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  full_name?: string;

  @ApiProperty({
    example: 'Khoa Nội Tổng hợp',
    required: false,
    description: 'Tên phòng ban hoặc khoa trực thuộc',
  })
  @IsOptional()
  @IsString({ message: 'Tên khoa/phòng ban phải là chuỗi' })
  department?: string;

  @ApiProperty({
    example: 'Bác sĩ chuyên khoa II',
    required: false,
    description: 'Chức vụ hoặc chức danh của nhân viên',
  })
  @IsOptional()
  @IsString({ message: 'Chức vụ phải là chuỗi' })
  position?: string;

  @ApiProperty({
    example: 'BS123456',
    required: false,
    description: 'Số giấy phép hành nghề của bác sĩ (nếu có)',
  })
  @IsOptional()
  @Matches(/^[A-Za-z0-9-]{4,20}$/, { message: 'Số giấy phép hành nghề không hợp lệ' })
  license_number?: string;

  @ApiProperty({
    enum: DoctorType,
    required: false,
    example: DoctorType.CLINICAL,
    description: 'Loại bác sĩ (CLINICAL, DIAGNOSTIC, TEST)',
  })
  @IsOptional()
  @IsEnum(DoctorType, { message: 'Loại bác sĩ không hợp lệ' })
  doctor_type?: DoctorType;
}
