import { ApiProperty } from '@nestjs/swagger';

export class AddWorkScheduleDto {
  @ApiProperty()
  staff_id: string;

  @ApiProperty({ type: String, format: 'date' })
  work_date: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  start_time?: Date;

  @ApiProperty({ type: String, format: 'date-time', required: false })
  end_time?: Date;
}