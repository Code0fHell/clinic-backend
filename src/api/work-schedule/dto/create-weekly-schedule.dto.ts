import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsArray, IsDateString, IsInt, Min, IsNotEmpty } from 'class-validator';

export class CreateWeeklyScheduleDto {
  @ApiProperty({
    example: 'fcd9e4f0-3b16-4b2b-b2b5-9d7df66aab1a',
    description: 'ID của nhân viên',
  })
  @IsUUID('4', { message: 'staff_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'staff_id là bắt buộc' })
  staff_id: string;

  @ApiProperty({
    example: ['2025-01-06', '2025-01-07', '2025-01-08'],
    description: 'Danh sách các ngày làm việc trong tuần',
    type: [String],
  })
  @IsArray({ message: 'working_dates phải là mảng' })
  @IsDateString({}, { each: true, message: 'Mỗi ngày phải là định dạng hợp lệ (YYYY-MM-DD)' })
  working_dates: string[];

  @ApiProperty({
    example: '08:00',
    description: 'Thời gian bắt đầu làm việc (HH:mm)',
  })
  @IsNotEmpty({ message: 'start_time là bắt buộc' })
  start_time: string;

  @ApiProperty({
    example: '17:00',
    description: 'Thời gian kết thúc làm việc (HH:mm)',
  })
  @IsNotEmpty({ message: 'end_time là bắt buộc' })
  end_time: string;

  @ApiProperty({
    example: 30,
    description: 'Thời lượng mỗi slot (phút)',
  })
  @IsInt({ message: 'slot_duration phải là số nguyên' })
  @Min(15, { message: 'slot_duration phải ít nhất 15 phút' })
  slot_duration: number;
}

