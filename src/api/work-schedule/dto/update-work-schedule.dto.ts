import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class UpdateWorkScheduleDto {
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

