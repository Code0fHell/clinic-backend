import { ApiProperty } from '@nestjs/swagger';

export class BookAppointmentDto {
  @ApiProperty( {required: true})
  doctor_id: string;

  @ApiProperty( {required: true})
  schedule_detail_id: string;

  @ApiProperty()
  appointment_date: Date;

  @ApiProperty()
  scheduled_date: Date;

  @ApiProperty( { required: true})
  reason?: string
}