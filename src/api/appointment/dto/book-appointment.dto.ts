import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class BookAppointmentDto {
  @ApiProperty( {required: true})
  @IsNotEmpty()
  @IsString()
  doctor_id: string;

  @ApiProperty( {required: true})
  @IsNotEmpty()
  @IsString()
  schedule_detail_id: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  appointment_date: Date;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  scheduled_date: Date;

  @ApiProperty( { required: true})
  @IsString()
  @IsNotEmpty()
  reason?: string
}