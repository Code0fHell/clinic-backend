import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsOptional, IsNotEmpty, } from 'class-validator';

export class AddWorkScheduleDto {
  @ApiProperty({
    example: 'fcd9e4f0-3b16-4b2b-b2b5-9d7df66aab1a',
    description: 'ID của nhân viên cần tạo lịch làm việc',
  })
  @IsUUID('4', { message: 'staff_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'staff_id là bắt buộc' })
  staff_id: string;

  @ApiProperty({
    example: '2025-11-05',
    type: String,
    format: 'date',
    description: 'Ngày làm việc của nhân viên (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'work_date phải là ngày hợp lệ (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'work_date là bắt buộc' })
  work_date: Date;

  @ApiProperty({
    example: '2025-11-05T08:00:00.000Z',
    type: String,
    format: 'date-time',
    required: false,
    description: 'Thời gian bắt đầu ca làm việc (ISO 8601)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'start_time phải là định dạng ngày giờ hợp lệ' })
  start_time?: Date;

  @ApiProperty({
    example: '2025-11-05T17:00:00.000Z',
    type: String,
    format: 'date-time',
    required: false,
    description: 'Thời gian kết thúc ca làm việc (ISO 8601)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'end_time phải là định dạng ngày giờ hợp lệ' })
  end_time?: Date;
}
