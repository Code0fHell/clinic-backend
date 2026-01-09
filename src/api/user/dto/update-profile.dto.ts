import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../shared/enums/gender.enum';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { IsOptional, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  full_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  date_of_birth?: Date;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: UserRole, required: false })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Vai trò người dùng không hợp lệ' })
  user_role?: UserRole;
}