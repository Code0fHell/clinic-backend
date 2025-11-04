import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsDateString, IsNotEmpty, Validate, } from 'class-validator';
import { IsAfterConstraint } from '../../../common/validators/is-after.validator';

export class AddWorkScheduleDetailDto {
  @ApiProperty({
    example: 'd12bcf09-2c7f-4bb5-8173-64aef7b8bcbf',
    description: 'ID của lịch làm việc cha',
  })
  @IsUUID('4', { message: 'schedule_id phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'schedule_id là bắt buộc' })
  schedule_id: string;

  @ApiProperty({
    example: '2025-11-05T08:00:00.000Z',
    type: String,
    format: 'date-time',
    description: 'Thời gian bắt đầu ca khám hoặc slot làm việc',
  })
  @IsDateString({}, { message: 'slot_start phải là ngày giờ hợp lệ (ISO 8601)' })
  @IsNotEmpty({ message: 'slot_start là bắt buộc' })
  slot_start: Date;

  @ApiProperty({
    example: '2025-11-05T09:00:00.000Z',
    type: String,
    format: 'date-time',
    description: 'Thời gian kết thúc ca khám hoặc slot làm việc',
  })
  @IsDateString({}, { message: 'slot_end phải là ngày giờ hợp lệ (ISO 8601)' })
  @IsNotEmpty({ message: 'slot_end là bắt buộc' })
  @Validate(IsAfterConstraint, ['slot_start'], {
    message: 'slot_end phải sau slot_start',
  })
  slot_end: Date;
}
