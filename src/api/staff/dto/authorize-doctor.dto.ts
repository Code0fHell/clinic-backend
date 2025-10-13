import { ApiProperty } from '@nestjs/swagger';
import { DoctorType } from '../../../shared/enums/doctor-type.enum';

export class AuthorizeDoctorDto {
  @ApiProperty({ enum: DoctorType })
  doctor_type: DoctorType;
}