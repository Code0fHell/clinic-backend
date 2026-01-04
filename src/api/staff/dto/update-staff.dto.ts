import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsEnum, IsBoolean } from 'class-validator';
import { DoctorType } from '../../../shared/enums/doctor-type.enum';

export class UpdateStaffDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  license_number?: string;

  @ApiProperty({ enum: DoctorType, required: false })
  @IsOptional()
  @IsEnum(DoctorType)
  doctor_type?: DoctorType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  is_available?: boolean;
}

