import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class GetStaffWeeklyScheduleDto {
  @ApiProperty({
    example: 'fcd9e4f0-3b16-4b2b-b2b5-9d7df66aab1a',
    description: 'ID của nhân viên',
  })
  @IsUUID('4', { message: 'staff_id phải là UUID hợp lệ' })
  staff_id: string;

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
}

