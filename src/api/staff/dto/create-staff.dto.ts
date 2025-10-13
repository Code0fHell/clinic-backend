import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { DoctorType } from '../../../shared/enums/doctor-type.enum';

export class CreateStaffDto {
  @ApiProperty({ enum: UserRole })
  user_role: UserRole; // RECEPTIONIST, PHARMACIST, DOCTOR

  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  full_name?: string;

  @ApiProperty({ required: false })
  department?: string;

  @ApiProperty({ required: false })
  position?: string;

  @ApiProperty({ required: false })
  license_number?: string;

  @ApiProperty({ enum: DoctorType, required: false })
  doctor_type?: DoctorType;
}