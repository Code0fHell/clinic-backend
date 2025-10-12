import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../shared/enums/gender.enum';
import { UserRole } from '../../../shared/enums/user-role.enum';

export class RegisterDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  full_name?: string;

  @ApiProperty({ required: false })
  date_of_birth?: Date;

  @ApiProperty({ enum: Gender, required: false })
  gender?: Gender;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  address?: string;

  @ApiProperty({ enum: UserRole })
  user_role: UserRole;
}
