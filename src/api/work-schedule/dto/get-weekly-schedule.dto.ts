import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class GetWeeklyScheduleDto {
  @ApiProperty({
    example: '2025-01-06',
    description: 'Ngày bắt đầu tuần (ISO 8601: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'start_date phải là ngày hợp lệ (YYYY-MM-DD)' })
  start_date: string;

  @ApiProperty({
    example: '2025-01-12',
    description: 'Ngày kết thúc tuần (ISO 8601: YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'end_date phải là ngày hợp lệ (YYYY-MM-DD)' })
  end_date: string;

  @ApiProperty({
    example: 'Nội khoa',
    required: false,
    description: 'Lọc theo khoa/phòng',
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({
    example: 'CLINICAL',
    required: false,
    description: 'Lọc theo loại bác sĩ (CLINICAL, DIAGNOSTIC, TEST)',
  })
  @IsOptional()
  @IsString()
  doctor_type?: string;
}

