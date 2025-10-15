import { ApiProperty } from '@nestjs/swagger';

export class BookAppointmentDto {
  @ApiProperty()
  doctor_id: string;

  @ApiProperty()
  schedule_detail_id: string;

  @ApiProperty()
  appointment_date: Date;
}