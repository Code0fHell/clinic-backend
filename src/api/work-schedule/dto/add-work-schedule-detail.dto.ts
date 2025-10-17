import { ApiProperty } from '@nestjs/swagger';

export class AddWorkScheduleDetailDto {
  @ApiProperty()
  schedule_id: string;

  @ApiProperty({ type: String, format: 'date-time' })
  slot_start: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  slot_end: Date;
}