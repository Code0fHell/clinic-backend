import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Gender } from '../../../shared/enums/gender.enum';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty({
    example: 'doctor001',
    description: 'Tên đăng nhập của người dùng (duy nhất)',
  })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi' })
  @MinLength(6, { message: 'Tên đăng nhập phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Tên đăng nhập không được vượt quá 50 ký tự' })
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Mật khẩu người dùng',
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  @MaxLength(100, { message: 'Mật khẩu không được vượt quá 100 ký tự' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, {
    message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 chữ số',
  })
  password: string;

  @ApiProperty({
    example: 'doctor001@gmail.com',
    description: 'Địa chỉ email hợp lệ',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({ example: 'Nguyễn Văn A', required: false })
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  full_name?: string;

  @ApiProperty({ example: '1990-05-10', required: false })
  @IsOptional()
  date_of_birth?: Date;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  gender?: Gender;

  @ApiProperty({ example: '0912345678', required: false })
  @IsOptional()
  @Matches(/^(0|\+84)(\d{9,10})$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone?: string;

  @ApiProperty({ example: '123 Đường ABC, Hà Nội', required: false })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  @MaxLength(255, { message: 'Địa chỉ quá dài' })
  address?: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.DOCTOR,
    description: 'Vai trò của người dùng (ví dụ: DOCTOR, OWNER, STAFF, ...)',
  })
  @IsNotEmpty({ message: 'Vai trò người dùng không được để trống' })
  @IsEnum(UserRole, { message: 'Vai trò người dùng không hợp lệ' })
  user_role: UserRole;
}
